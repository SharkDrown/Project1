using BackEnd.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;
        public AccountController(QuanLyThuVienContext context)
        {
            _context = context;
        }

        // Lấy thông tin tài khoản đang đăng nhập
        [HttpGet("me")]
        public async Task<IActionResult> GetMyAccount()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var id = int.Parse(userId);

            var acc = await _context.TaiKhoans
                .Include(d => d.DocGium)
                .Include(n => n.NhanVien)
                .FirstOrDefaultAsync(x => x.MaTk == id);

            if (acc == null) return NotFound();

            if (acc.VaiTro == "DocGia" && acc.DocGium != null)
            {
                return Ok(new
                {
                    acc.TenDangNhap,
                    acc.VaiTro,
                    acc.DocGium.HoTen,
                    acc.DocGium.NgaySinh,
                    acc.DocGium.DiaChi,
                    acc.DocGium.Email,
                    SoDT = acc.DocGium.SoDt
                });
            }
            else if (acc.VaiTro == "NhanVien" && acc.NhanVien != null)
            {
                return Ok(new
                {
                    acc.TenDangNhap,
                    acc.VaiTro,
                    acc.NhanVien.HoTen,
                    acc.NhanVien.ChucVu,
                    acc.NhanVien.Email,
                    SoDT = acc.NhanVien.SoDt
                });
            }
            else if (acc.VaiTro == "Admin")
            {
                var nv = acc.NhanVien;

                return Ok(new
                {
                    acc.TenDangNhap,
                    acc.VaiTro,
                    HoTen = nv?.HoTen ?? "",
                    Email = nv?.Email ?? "",
                    SoDt = nv?.SoDt ?? "",
                    ChucVu = nv?.ChucVu ?? ""
                });
            }

            return BadRequest(new { message = "Không tìm thấy thông tin người dùng" });
        }

        // Update thông tin
        [HttpPut("update")]
        public async Task<IActionResult> UpdateAccount([FromBody] UpdateAccountDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var id = int.Parse(userId);

            var acc = await _context.TaiKhoans
                .Include(d => d.DocGium)
                .Include(n => n.NhanVien)
                .FirstOrDefaultAsync(x => x.MaTk == id);

            if (acc == null) return NotFound();

            // Kiểm tra nếu đổi tên đăng nhập
            if (!string.IsNullOrEmpty(dto.TenDangNhap) && dto.TenDangNhap != acc.TenDangNhap)
            {
                var exists = await _context.TaiKhoans.AnyAsync(x => x.TenDangNhap == dto.TenDangNhap);
                if (exists)
                    return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });

                acc.TenDangNhap = dto.TenDangNhap;
            }

            // Đổi mật khẩu
            if (!string.IsNullOrEmpty(dto.MatKhauCu) || !string.IsNullOrEmpty(dto.MatKhauMoi))
            {
                if (string.IsNullOrEmpty(dto.MatKhauCu) || string.IsNullOrEmpty(dto.MatKhauMoi))
                    return BadRequest(new { message = "Phải nhập đầy đủ cả mật khẩu cũ và mật khẩu mới" });

                var check = BCrypt.Net.BCrypt.Verify(dto.MatKhauCu, acc.MatKhau);
                if (!check)
                    return BadRequest(new { message = "Mật khẩu cũ không đúng" });

                acc.MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.MatKhauMoi);
            }

            // Cập nhật thông tin tuỳ theo vai trò
            if (acc.VaiTro == "DocGia" && acc.DocGium != null)
            {
                if (!string.IsNullOrEmpty(dto.HoTen)) acc.DocGium.HoTen = dto.HoTen;
                if (dto.NgaySinh.HasValue) acc.DocGium.NgaySinh = dto.NgaySinh.Value;
                if (!string.IsNullOrEmpty(dto.DiaChi)) acc.DocGium.DiaChi = dto.DiaChi;
                if (!string.IsNullOrEmpty(dto.Email)) acc.DocGium.Email = dto.Email;
                if (!string.IsNullOrEmpty(dto.SoDT)) acc.DocGium.SoDt = dto.SoDT;
            }
            else if (acc.VaiTro == "NhanVien" && acc.NhanVien != null)
            {
                if (!string.IsNullOrEmpty(dto.HoTen)) acc.NhanVien.HoTen = dto.HoTen;
                if (!string.IsNullOrEmpty(dto.Email)) acc.NhanVien.Email = dto.Email;
                if (!string.IsNullOrEmpty(dto.SoDT)) acc.NhanVien.SoDt = dto.SoDT;
                if (!string.IsNullOrEmpty(dto.ChucVu)) acc.NhanVien.ChucVu = dto.ChucVu;
            }
            else if(acc.VaiTro == "Admin" && acc.NhanVien != null)
            {
                if (!string.IsNullOrEmpty(dto.HoTen)) acc.NhanVien.HoTen = dto.HoTen;
                if (!string.IsNullOrEmpty(dto.Email)) acc.NhanVien.Email = dto.Email;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công" });
        }

        // Vô hiệu hóa tài khoản
        [HttpDelete("deactivate")]
        public async Task<IActionResult> DeactivateMyAccount()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var id = int.Parse(userId);

            var account = await _context.TaiKhoans.FindAsync(id);
            if (account == null)
                return NotFound(new { message = "Tài khoản không tồn tại" });

            account.TrangThai = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tài khoản đã bị vô hiệu hóa" });
        }

        // ADMIN THỰC HIỆN
        // lấy toàn bộ nhân viên 
        [HttpGet ("all-staff")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> GetAllStaff()
        {
           var list = await _context.NhanViens
                .Join(
                    _context.TaiKhoans,
                    nv => nv.MaTk,
                    tk => tk.MaTk,
                    (nv, tk) => new { nv, tk }
                )
                .Where(x => x.tk.VaiTro == "NhanVien" && x.tk.TrangThai==true)  
                .Select(x => new
                {
                    x.nv.MaNv,
                    x.nv.HoTen,
                    x.nv.ChucVu,
                    x.nv.Email,
                    SoDT = x.nv.SoDt,
                    x.nv.MaTk,
                    x.tk.VaiTro
                })
                .ToListAsync();

            return Ok(list);
        }

        [HttpDelete("deactivate-staff/{maTK}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeactivateStaffAccount(int maTK)
        {
            var account = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.MaTk == maTK);

            if (account == null)
                return NotFound(new { message = "Tài khoản không tồn tại" });

            if (account.VaiTro == "Admin")
                return BadRequest(new { message = "Không thể vô hiệu hóa tài khoản Admin" });

            account.TrangThai = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã vô hiệu hóa tài khoản nhân viên" });
        }

        [HttpPut("update-staff")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStaff([FromBody] UpdateStaffDto dto)
        {
            var nv = await _context.NhanViens
                        .FirstOrDefaultAsync(n => n.MaNv == dto.MaNV);

            if (nv == null)
                return NotFound(new { message = "Nhân viên không tồn tại" });

            if (!string.IsNullOrWhiteSpace(dto.ChucVu))
                nv.ChucVu = dto.ChucVu;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật chức vụ nhân viên thành công" });
        }

        [HttpGet("search-staff")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SearchStaff([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return BadRequest(new { message = "Từ khóa tìm kiếm không được để trống!" });

            keyword = keyword.Trim().ToLower();

            // Kiểm tra keyword có phải là số (mã NV)
            bool isNumber = int.TryParse(keyword, out int maNvSearch);

            var list = await _context.NhanViens
                .Join(
                    _context.TaiKhoans,
                    nv => nv.MaTk,
                    tk => tk.MaTk,
                    (nv, tk) => new { nv, tk }
                )
                .Where(x =>
                    x.tk.VaiTro == "NhanVien" &&
                    x.tk.TrangThai == true &&
                    (
                        x.nv.HoTen.ToLower().Contains(keyword) ||   // tìm theo tên
                        (isNumber && x.nv.MaNv == maNvSearch)       // tìm theo mã NV
                    )
                )
                .Select(x => new
                {
                    x.nv.MaNv,
                    x.nv.HoTen,
                    x.nv.ChucVu,
                    x.nv.Email,
                    SoDT = x.nv.SoDt,
                    x.nv.MaTk,
                    x.tk.VaiTro
                })
                .ToListAsync();

            return Ok(list);
        }


        // THỐNG KÊ

        // Độc giả
        [HttpGet("stats/readers-per-month")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetReadersPerMonth()
        {
            var result = await _context.TaiKhoans
                .Where(d => d.VaiTro =="DocGia")
                .GroupBy(d => d.LastActive!.Value.Month) 
                .Select(g => new {
                    Thang = g.Key,
                    SoLuong = g.Count()
                })
                .OrderBy(x => x.Thang)
                .ToListAsync();

            return Ok(result);
        }

        // mượn

        [HttpGet("stats/borrow")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBorrowStats()
        {
            var result = await _context.PhieuMuons
                .Where(p => p.NgayMuon != null)
                .GroupBy(p => p.NgayMuon.Value.Month)
                .Select(g => new {
                    Thang = g.Key,
                    LuotMuon = g.Count()
                })
                .OrderBy(x => x.Thang)
                .ToListAsync();

            return Ok(result);
        }


        //trả

        [HttpGet("stats/return")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetReturnStats()
        {
            var result = await _context.ChiTietPhieuMuons
                .Where(c => c.NgayTraThucTe != null)
                .GroupBy(c => c.NgayTraThucTe.Value.Month)
                .Select(g => new {
                    Thang = g.Key,
                    LuotTra = g.Count()
                })
                .OrderBy(x => x.Thang)
                .ToListAsync();

            return Ok(result);
        }


        //vi phạm
        [HttpGet("stats/violations-per-month")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetViolationStats()
        {
            var result = await _context.PhieuPhats
                .GroupBy(p => p.NgayPhat!.Value.Month)
                .Select(g => new {
                    Thang = g.Key,
                    ViPham = g.Count()
                })
                .OrderBy(x => x.Thang)
                .ToListAsync();

            return Ok(result);
        }

        // số sách tốt hỏng
        [HttpGet("stats/book-condition")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBookCondition()
        {
            var tong = await _context.CuonSaches.CountAsync();
            var tot = await _context.CuonSaches.CountAsync(s => s.TinhTrang == "Tot");
            var hong = tong - tot;

            return Ok(new
            {
                TongSach = tong,
                SachTot = tot,
                SachHong = hong
            });
        }

        // tổng quan 
        [HttpGet("stats/overview")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetOverview()
        {
            var docs = await _context.DocGia.CountAsync();
            var books = await _context.Saches.CountAsync();
            var borrow = await _context.PhieuMuons.CountAsync();
            var violation = await _context.PhieuPhats.CountAsync();

            return Ok(new {
                TongDocGia = docs,
                TongSach = books,
                TongPhieuMuon = borrow,
                TongViPham = violation
            });
        }






    }
}
