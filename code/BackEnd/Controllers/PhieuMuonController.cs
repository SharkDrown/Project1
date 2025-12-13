using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Models;
using System;
using System.Security.Claims; // Thêm thư viện này để xử lý Claims
using System.Globalization;
using Microsoft.AspNetCore.Authorization;
namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhieuMuonController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;

        public PhieuMuonController(QuanLyThuVienContext context)
        {
            _context = context;
        }

        // --- GET: Lấy Danh sách Phiếu Mượn (Hiển thị trang Trả) ---
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.PhieuMuons
                .Include(p => p.ChiTietPhieuMuons)
                    .ThenInclude(ct => ct.MaVachNavigation) // CuonSach
                        .ThenInclude(cs => cs.MaSachNavigation) // Sach (để lấy TenSach)
                .OrderByDescending(p => p.NgayMuon)
                .Select(p => new
                {
                    p.MaPm,
                    p.MaDg,
                    p.MaNv,

                    NgayMuon = p.NgayMuon.HasValue ? p.NgayMuon.Value.ToString("dd/MM/yyyy") : "",
                    NgayTra = p.NgayTra.HasValue ? p.NgayTra.Value.ToString("dd/MM/yyyy") : "",

                    // Nhóm chi tiết lại theo Tên Sách và đếm Số Lượng mượn
                    ChiTietSachHienThi = string.Join("\n", p.ChiTietPhieuMuons
                        .Where(ct => ct.MaVachNavigation != null && ct.MaVachNavigation.MaSachNavigation != null)
                        .GroupBy(ct => ct.MaVachNavigation!.MaSachNavigation!.TuaSach)
                        .Select(g => $"{g.Key} : {g.Count()} cuốn") // Tạo chuỗi "Tên sách - SL cuốn"
                        .ToList()
                    )
                })
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyPhieuMuons(
                int page = 1,
                int pageSize = 3
            )
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 3;

            var maTkClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(maTkClaim, out int maTk))
                return Unauthorized();

            var docGia = await _context.DocGia
                .FirstOrDefaultAsync(d => d.MaTk == maTk);

            if (docGia == null)
                return NotFound();

            var query = _context.PhieuMuons
                .Where(p => p.MaDg == docGia.MaDg);

            var totalItems = await query.CountAsync();

            var data = await query
                .Include(p => p.ChiTietPhieuMuons)
                    .ThenInclude(ct => ct.MaVachNavigation)
                        .ThenInclude(cs => cs.MaSachNavigation)
                            .ThenInclude(s => s.MaTlNavigation)
                .OrderByDescending(p => p.NgayMuon)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    maPm = p.MaPm,
                    ngayMuon = p.NgayMuon,
                    ngayTra = p.NgayTra,

                    items = p.ChiTietPhieuMuons
                        .Where(ct => ct.MaVachNavigation != null &&
                                     ct.MaVachNavigation.MaSachNavigation != null)
                        .GroupBy(ct => ct.MaVachNavigation!.MaSachNavigation!)
                        .Select(g => new
                        {
                            maSach = g.First().MaVachNavigation!.MaSachNavigation!.MaSach,
                            tuaSach = g.First().MaVachNavigation!.MaSachNavigation!.TuaSach,
                            theLoai = g.First().MaVachNavigation!.MaSachNavigation!.MaTlNavigation != null
                                    ? g.First().MaVachNavigation!.MaSachNavigation!.MaTlNavigation!.TenTl : null,
                            soLuong = g.Count()
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(new
            {
                page,
                pageSize,
                totalItems,
                totalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                data
            });
        }




        // --- POST: Tạo Phiếu Mượn Mới ---
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePhieuMuonDto dto)
        {
            
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int maTk))
            {
                return Unauthorized("Không tìm thấy thông tin người dùng hợp lệ.");
            }
            var nhanVien = await _context.NhanViens.FirstOrDefaultAsync(nv => nv.MaTk == maTk);

            if (nhanVien == null)
            {
                // Fallback: Nếu không tìm thấy qua MaTK, thử kiểm tra xem user có gửi MaNv trực tiếp không (cho test)
                if (dto.MaNv.HasValue)
                {
                    nhanVien = await _context.NhanViens.FindAsync(dto.MaNv.Value);
                }

                if (nhanVien == null)
                {
                    return BadRequest($"Không tìm thấy hồ sơ Nhân Viên liên kết với tài khoản này (MaTK: {maTk}).");
                }
            }
            int maNv = nhanVien.MaNv;
            // ⭐️ KIỂM TRA TÍNH HỢP LỆ CƠ BẢN
            if (dto == null || dto.MaDg <= 0 || !dto.NgayTra.HasValue)
            {
                return BadRequest("Dữ liệu tạo phiếu mượn không hợp lệ: Thiếu Mã Độc Giả hoặc Ngày Trả.");
            }

            // ⭐️ KIỂM TRA THÊM: MaNv PHẢI TỒN TẠI trong database
            //var nhanVien = await _context.NhanViens.FindAsync(maNv);
            //if (nhanVien == null)
            //{
            //    // Nếu MaNv không tồn tại, trả lỗi Khóa Ngoại cụ thể
            //    return BadRequest($"Lỗi Khóa Ngoại: Không tìm thấy Nhân viên có MaNv = {maNv}. Vui lòng kiểm tra dữ liệu.");
            //}

            // 1. Tìm các yêu cầu đặt trước đã được DUYỆT ('DaNhan') của Độc giả này
            var cacYeuCauDaDuyet = await _context.DatTruocs
                .Where(d => d.MaDg == dto.MaDg && d.TrangThai == "DaNhan")
                .ToListAsync();

            if (!cacYeuCauDaDuyet.Any())
            {
                return BadRequest("Độc giả không có yêu cầu nào ở trạng thái 'Đã Nhận' để tạo phiếu.");
            }

            var listMaDat = cacYeuCauDaDuyet.Select(d => d.MaDat).ToList();

            // 2. Tìm các cuốn sách (MaVach) đang được gán cho các yêu cầu này
            // Lưu ý: Đảm bảo CuonSach.MaDat là nullable (int?) nếu không sẽ lỗi ở bước 4
            var cacCuonSachCanMuon = await _context.CuonSaches
                .Where(c => c.MaDat.HasValue && listMaDat.Contains(c.MaDat.Value))
                .ToListAsync();

            if (!cacCuonSachCanMuon.Any())
            {
                return BadRequest("Không tìm thấy cuốn sách nào đã được chọn cho các yêu cầu đã duyệt.");
            }

            // 3. Tạo Header Phiếu Mượn
            var phieuMuon = new PhieuMuon
            {
                MaDg = dto.MaDg,
                MaNv = maNv, // Dùng MaNv đã được kiểm tra từ JWT hoặc fallback
                NgayMuon = DateOnly.FromDateTime(DateTime.Now),
                NgayTra = dto.NgayTra.Value // Lấy giá trị non-nullable
            };

            _context.PhieuMuons.Add(phieuMuon);

            // ⭐️ LƯU LẦN 1: TẠO PHIẾU MƯỢN CHÍNH (ĐỂ LẤY MaPm)
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Trả về lỗi chi tiết nếu không thể tạo Header
                Console.WriteLine($"LỖI SERVER (POST Header): {ex.Message}");
                return StatusCode(500, $"Lỗi Server khi tạo Phiếu Mượn Header: {ex.InnerException?.Message ?? ex.Message}");
            }

            // 4. Tạo Chi Tiết Phiếu Mượn và cập nhật trạng thái Cuốn Sách
            foreach (var cuonSach in cacCuonSachCanMuon)
            {
                // Tạo chi tiết
                var chiTiet = new ChiTietPhieuMuon
                {
                    MaPm = phieuMuon.MaPm,
                    MaVach = cuonSach.MaVach,
                    // Giữ nguyên là 'null' vì nó là nullable trong model ChiTietPhieuMuon
                    NgayTraThucTe = null
                };
                _context.ChiTietPhieuMuons.Add(chiTiet);

                // Cập nhật Cuốn Sách
                // Cần đảm bảo CuonSach.MaDat là kiểu int? (nullable) trong model
                cuonSach.MaDat = null; // Gán null cho trường MaDat (đã hết đặt trước)
                cuonSach.TinhTrang = "DangMuon";
                _context.CuonSaches.Update(cuonSach);
            }

            // 5. Cập nhật trạng thái các yêu cầu Đặt trước đã dùng
            foreach (var yeuCau in cacYeuCauDaDuyet)
            {
                yeuCau.TrangThai = "DaNhan";
                _context.DatTruocs.Update(yeuCau);
            }

            // ⭐️ LƯU LẦN 2: LƯU CHI TIẾT VÀ CẬP NHẬT TRẠNG THÁI
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Trả về lỗi chi tiết nếu không thể lưu Chi Tiết/Trạng thái Sách
                Console.WriteLine($"LỖI SERVER (POST Chi Tiết): {ex.Message}");
                // ⭐️ THAY ĐỔI: Sử dụng InnerException để tìm lỗi SQL/Constraint
                return StatusCode(500, $"Lỗi Server khi cập nhật trạng thái sách: {ex.InnerException?.Message ?? ex.Message}");
            }

            return Ok(new { message = "Tạo phiếu mượn thành công!", maPM = phieuMuon.MaPm });
        }

        // --- DELETE: Xóa Phiếu Mượn ---
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // 1. Tìm Phiếu Mượn chính
            var phieuMuon = await _context.PhieuMuons
                                .Include(pm => pm.ChiTietPhieuMuons)
                                .FirstOrDefaultAsync(pm => pm.MaPm == id);

            if (phieuMuon == null) return NotFound("Không tìm thấy phiếu mượn.");

            // 2. Tải các bản ghi Chi Tiết Phiếu Mượn liên quan
            var chiTietMuons = await _context.ChiTietPhieuMuons
                                            .Include(ct => ct.MaVachNavigation) // Tải cuốn sách
                                            .Where(ct => ct.MaPm == id)
                                            .ToListAsync();

            // 3. Bổ sung Logic: Xử lý trạng thái Cuốn Sách trước khi xóa Chi Tiết
            foreach (var chiTiet in chiTietMuons)
            {
                var cuonSach = chiTiet.MaVachNavigation;

                // CHỈ cập nhật trạng thái sách nếu nó vẫn đang ở trạng thái 'DangMuon'
                if (cuonSach != null && cuonSach.TinhTrang == "DangMuon" && chiTiet.NgayTraThucTe == null)
                {
                    // Chuyển về trạng thái sẵn sàng (SanSang)
                    cuonSach.TinhTrang = "Tot";
                    _context.CuonSaches.Update(cuonSach);
                }
            }

            // 4. Xóa Chi Tiết Phiếu Mượn khỏi Context
            if (chiTietMuons.Any())
            {
                _context.ChiTietPhieuMuons.RemoveRange(chiTietMuons);
            }

            // 5. Xóa Phiếu Mượn chính
            _context.PhieuMuons.Remove(phieuMuon);

            // 6. Lưu thay đổi vào cơ sở dữ liệu
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Trả về lỗi chi tiết nếu vẫn còn xung đột khóa ngoại
                return StatusCode(500, $"Lỗi Server: Không thể xóa Phiếu Mượn. {ex.InnerException?.Message ?? ex.Message}");
            }

            return NoContent();
        }
    }
}