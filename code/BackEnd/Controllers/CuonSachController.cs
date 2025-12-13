using BackEnd.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CuonSachController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;

        public CuonSachController(QuanLyThuVienContext context)
        {
            _context = context;
        }
        [HttpGet("by-masach/{maSach}")]
        public async Task<IActionResult> GetCuonSachByMaSach(int maSach)
        {
            var result = await _context.CuonSaches
                .Where(c => c.MaSach == maSach)
                .OrderBy(c => c.MaVach)
                .Select(c => new
                {
                    c.MaVach,
                    c.MaSach,
                    c.TinhTrang,
                    c.MaDat
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("trangthai")]
        public async Task<IActionResult> GetAllBookItemsWithStatus()
        {
            //var query = from cs in _context.CuonSaches
            //            join s in _context.Saches on cs.MaSach equals s.MaSach

            //            join ctpm in _context.ChiTietPhieuMuons
            //                .Where(ct => ct.NgayTraThucTe == null)
            //            on cs.MaVach equals ctpm.MaVach into muontemp
            //            from muon in muontemp.DefaultIfEmpty()

            //            join pm in _context.PhieuMuons on muon.MaPm equals pm.MaPm into pmtmp
            //            from pm in pmtmp.DefaultIfEmpty()

            //            join dg in _context.DocGia on pm.MaDg equals dg.MaDg into dgtmp
            //            from dg in dgtmp.DefaultIfEmpty()
            var query = from cs in _context.CuonSaches
                        join s in _context.Saches on cs.MaSach equals s.MaSach

                        // ⭐️ BƯỚC 1: XÁC ĐỊNH MAPM CUỐI CÙNG CHO CUỐN SÁCH
                        join latestCtpm in _context.ChiTietPhieuMuons on cs.MaVach equals latestCtpm.MaVach into ctpmGroup
                        from muon in ctpmGroup
                            // Chọn bản ghi ChiTietPhieuMuon có MaPm lớn nhất (mới nhất)
                            .OrderByDescending(ct => ct.MaPm)
                            .Take(1)
                            .DefaultIfEmpty() // Left Join ChiTietPhiếuMượn mới nhất

                            // BƯỚC 2: LEFT JOIN PHIEUMUON (pm)
                        join p in _context.PhieuMuons on muon.MaPm equals p.MaPm into pmtmp
                        from pm in pmtmp.DefaultIfEmpty()

                            // BƯỚC 3: LEFT JOIN DOCGIA (dg)
                        join d in _context.DocGia on pm.MaDg equals d.MaDg into dgtmp
                        from dg in dgtmp.DefaultIfEmpty()

                        select new
                        {
                            MaVach = cs.MaVach,
                            MaSach = cs.MaSach,
                            TuaSach = s.TuaSach,
                            MaPm = (int?)muon.MaPm,
                            TrangThai = (muon == null) ? cs.TinhTrang :
                            (muon.NgayTraThucTe == null ? "DangMuon" : cs.TinhTrang),
                            NgayMuon = pm != null ? pm.NgayMuon : (DateOnly?)null,
                            NgayTra = pm != null ? pm.NgayTra : (DateOnly?)null,
                            MaDg = (int?)pm.MaDg,
                            TenDg = dg.HoTen,
                            NgayTraThucTe = muon != null ? muon.NgayTraThucTe : (DateOnly?)null,
                        };

            var intermediateResult = await query.ToListAsync();

            // Định dạng ngày tháng sau khi truy vấn kết thúc
            var finalResult = intermediateResult.Select(item => new
            {
                item.MaVach,
                item.MaSach,
                item.TuaSach,
                item.MaPm,
                TrangThai = item.TrangThai,
                NgayMuon = item.NgayMuon?.ToString("dd-MM-yyyy"),
                NgayTra = item.NgayTra?.ToString("dd-MM-yyyy"),
                item.MaDg,
                item.TenDg,
                NgayTraThucTe = item.NgayTraThucTe?.ToString("dd-MM-yyyy")
            });
            return Ok(finalResult);
        }

        // --- API Gán Cuốn Sách vào Mã Đặt (Nghiệp vụ "Duyệt sách") ---
        // PUT /api/CuonSach/{maVach}/assign-reservation
        [HttpPut("{maVach}/assign-reservation")]
        public async Task<IActionResult> AssignReservation(string maVach, [FromBody] UpdateTinhTrangRequest req)
        {
            if (!req.MaDat.HasValue || req.MaDat.Value <= 0)
            {
                return BadRequest(new { message = "Mã Đặt (MaDat) không hợp lệ." });
            }

            var cuonSach = await _context.CuonSaches.FirstOrDefaultAsync(c => c.MaVach == maVach);
            if (cuonSach == null)
            {
                return NotFound(new { message = $"Không tìm thấy cuốn sách với Mã Vạch {maVach}." });
            }

            var maDat = req.MaDat.Value;
            var datTruoc = await _context.DatTruocs.FindAsync(maDat);

            if (datTruoc == null)
            {
                return NotFound(new { message = $"Không tìm thấy yêu cầu đặt trước với Mã Đặt {maDat}." });
            }

            // 1. KIỂM TRA TRẠNG THÁI SÁCH VÀ ĐẶT TRƯỚC
            // Sách phải có trạng thái vật lý Tốt (Tot) và không đang được gán cho MaDat nào khác
            if (cuonSach.TinhTrang != "Tot" || cuonSach.MaDat.HasValue)
            {
                return BadRequest(new { message = $"Cuốn sách đang ở trạng thái '{cuonSach.TinhTrang}' hoặc đã được gán cho MaDat khác. Chỉ có thể gán sách có trạng thái 'Tốt' và chưa được gán." });
            }

            // Yêu cầu đặt trước phải ở trạng thái Đã Duyệt
            if (datTruoc.TrangThai != "Cho" && datTruoc.TrangThai != "DaNhan")
            {
                return BadRequest(new { message = $"Yêu cầu đặt trước (MaDat: {maDat}) phải ở trạng thái 'Cho' hoặc 'Đã Nhận' để gán mã vạch." });
            }

            // 2. THỰC HIỆN GÁN & CHUYỂN TRẠNG THÁI
            cuonSach.MaDat = maDat;         // Gán Mã Đặt vào cuốn sách
            //cuonSach.TinhTrang = "DatTruoc"; // Chuyển trạng thái cuốn sách thành Đang Đặt (chờ mượn)

            datTruoc.TrangThai = "DaNhan";   // Cập nhật trạng thái Đặt trước thành Đã Nhận (chờ tạo phiếu mượn)

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"LỖI GÁN MÃ VẠCH: {ex.Message}");
                return StatusCode(500, new { message = $"Lỗi Server khi gán mã vạch: {ex.InnerException?.Message ?? ex.Message}" });
            }

            return Ok(new { message = $"Gán mã vạch {maVach} thành công cho Mã Đặt {maDat}. Sách sẵn sàng tạo phiếu mượn." });
        }


        // PUT: api/CuonSach/{maVach}/status

        [HttpPut("{maVach}/status")]
        public async Task<IActionResult> UpdateTinhTrang(string maVach, [FromBody] UpdateTinhTrangRequest req)
        {
            var book = await _context.CuonSaches.FindAsync(maVach);
            if (book == null)
                return NotFound(new { message = $"Không tìm thấy cuốn sách với Mã vạch {maVach}." });

            // 1. Lấy trạng thái hiện tại (dựa trên giao dịch) và thông tin mượn
            var currentBorrow = await _context.ChiTietPhieuMuons
                .FirstOrDefaultAsync(ctpm => ctpm.MaVach == maVach && ctpm.NgayTraThucTe == null);

            var currentStatus = currentBorrow != null ? "DangMuon" : book.TinhTrang;
            var newStatus = req.TinhTrang;

            // Kiểm tra trạng thái mới có hợp lệ không
            var validStatuses = new[] { "DangMuon", "Tot", "Hong", "Mat" };
            if (!validStatuses.Contains(newStatus))
            {
                return BadRequest(new { message = "Trạng thái không hợp lệ (Chỉ chấp nhận: DangMuon, Tot, Hong, Mat)." });
            }

            // ⭐️ LOGIC MỚI: Xử lý linh hoạt việc chuyển đổi trạng thái:

            if (currentStatus == "DangMuon")
            {
                // Xử lý Trả Sách
                if (newStatus == "Tot" || newStatus == "Hong" || newStatus == "Mat")
                {
                    // Trường hợp 1: DangMuon -> Tot/Hong/Mat (THAO TÁC TRẢ SÁCH)
                    if (currentBorrow != null)
                    {
                        currentBorrow.NgayTraThucTe = DateOnly.FromDateTime(DateTime.Today);// Hoàn tất giao dịch mượn

                        // Cập nhật TinhTrang vật lý của cuốn sách
                        book.TinhTrang = newStatus;
                        book.MaDat = null; // Đảm bảo cuốn sách không còn liên kết với bất kỳ MaDat nào
                    }
                    else
                    {
                        // Lỗi logic: Sách được xác định là DangMuon nhưng không tìm thấy bản ghi ChiTietPhieuMuon chưa trả.
                        return StatusCode(500, new { message = "Lỗi hệ thống: Không tìm thấy bản ghi mượn chưa trả, không thể hoàn tất giao dịch." });
                    }
                }
                // Trường hợp 2: DangMuon -> DangMuon (Không làm gì)
                else if (newStatus == "DangMuon")
                {
                    return Ok(new { message = "Trạng thái không thay đổi." });
                }
            }
            else // Sách không đang mượn (currentStatus là Tot, Hong, Mat, DatTruoc)
            {
                // Trường hợp 3: Chuyển sang DangMuon (KHÔNG CHO PHÉP TẠO GIAO DỊCH MƯỢN BẰNG TAY)
                if (newStatus == "DangMuon")
                {
                    return BadRequest(new { message = "Không thể chuyển trạng thái sang Đang Mượn. Vui lòng tạo Phiếu Mượn chính thức." });
                }

                // Trường hợp 4: Chuyển đổi trạng thái vật lý khác (CẬP NHẬT TÍNH TRẠNG)
                else
                {
                    book.TinhTrang = newStatus;
                    if (newStatus == "Tot" || newStatus == "Hong" || newStatus == "Mat")
                    {
                        book.MaDat = null; // Giải phóng MaDat khỏi cuốn sách
                    }
                }
            }

            // BƯỚC CUỐI: LƯU VÀ TRẢ KẾT QUẢ
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Xử lý lỗi đồng thời...
                if (!_context.CuonSaches.Any(e => e.MaVach == maVach))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            string successMessage;
            if (currentStatus == "DangMuon" && (newStatus == "Tot" || newStatus == "Hong" || newStatus == "Mat"))
            {
                successMessage = $"Trả sách thành công! Trạng thái vật lý được cập nhật thành: {newStatus}.";
            }
            else
            {
                successMessage = $"Cập nhật trạng thái vật lý thành công: {newStatus}.";
            }

            return Ok(new
            {
                message = successMessage,
                maVach = book.MaVach,
                tinhTrang = book.TinhTrang
            });
        }



    }
    public class UpdateTinhTrangRequest
    {
        public string TinhTrang { get; set; } = string.Empty;
        public int? MaDat { get; set; }
    }
}