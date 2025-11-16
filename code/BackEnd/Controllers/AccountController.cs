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
    }
}
