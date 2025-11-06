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
                .FirstOrDefaultAsync(x => x.MaTk == id);

            if (acc == null) return NotFound();

            return Ok(new
            {
                TenDangNhap = acc.TenDangNhap,
                HoTen = acc.DocGium?.HoTen,
                NgaySinh = acc.DocGium?.NgaySinh,
                DiaChi = acc.DocGium?.DiaChi,
                Email = acc.DocGium?.Email,
                SoDT = acc.DocGium?.SoDt
            });
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
                .FirstOrDefaultAsync(x => x.MaTk == id);

            if (acc == null) return NotFound();

            // Kiểm tra nếu đổi tên đăng nhập
            if (!string.IsNullOrEmpty(dto.TenDangNhap ) && dto.TenDangNhap != acc.TenDangNhap)
            {
                var exists = await _context.TaiKhoans.AnyAsync(x => x.TenDangNhap == dto.TenDangNhap);
                if (exists)
                    return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });

                acc.TenDangNhap = dto.TenDangNhap;
            }
            // Kiểm tra Email
            if (!string.IsNullOrEmpty(dto.Email) && dto.Email != acc.DocGium?.Email)
            {
                var emailExists = await _context.DocGia.AnyAsync(x => x.Email == dto.Email);
                if (emailExists)
                    return BadRequest(new { message = "Email đã được sử dụng" });

                if (acc.DocGium != null)
                    acc.DocGium.Email = dto.Email;
            }
            // Đổi mật khẩu
            if (!string.IsNullOrEmpty(dto.MatKhauCu) || !string.IsNullOrEmpty(dto.MatKhauMoi))
            {
                // Nếu chỉ nhập 1 trong 2 thì báo lỗi ngay
                if (string.IsNullOrEmpty(dto.MatKhauCu) || string.IsNullOrEmpty(dto.MatKhauMoi))
                {
                    return BadRequest(new { message = "Phải nhập đầy đủ cả mật khẩu cũ và mật khẩu mới" });
                }

                // Kiểm tra mật khẩu cũ có đúng không
                var check = BCrypt.Net.BCrypt.Verify(dto.MatKhauCu, acc.MatKhau);
                if (!check)
                {
                    return BadRequest(new { message = "Mật khẩu cũ không đúng" });
                }

                // Nếu đúng thì gán mật khẩu mới
                acc.MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.MatKhauMoi);
            }
            //Update thông tin độc giả
            if (acc.DocGium != null)
            {
                if (!string.IsNullOrEmpty(dto.HoTen)) acc.DocGium.HoTen = dto.HoTen;
                if (dto.NgaySinh.HasValue) acc.DocGium.NgaySinh = dto.NgaySinh.Value;
                if (!string.IsNullOrEmpty(dto.DiaChi)) acc.DocGium.DiaChi = dto.DiaChi;
                if (!string.IsNullOrEmpty(dto.Email)) acc.DocGium.Email = dto.Email;
                if (!string.IsNullOrEmpty(dto.SoDT)) acc.DocGium.SoDt = dto.SoDT;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thành công" });
        }

        //Vô hiệu hóa tài khoản
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
