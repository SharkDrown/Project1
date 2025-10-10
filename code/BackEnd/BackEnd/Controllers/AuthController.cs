using BackEnd.Dtos;
using BackEnd.Models;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            if (_context.TaiKhoans.Any(x => x.TenDangNhap == dto.TenDangNhap))
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });

            //string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.MatKhau);
            string hashedPassword = dto.MatKhau;
            var user = new TaiKhoan
            {
                TenDangNhap = dto.TenDangNhap,
                MatKhau = hashedPassword,
                VaiTro = dto.VaiTro,
                TrangThai = true
            };

            _context.TaiKhoans.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "Tạo tài khoản thành công!" });
        }


        // // ✅ API Đăng nhập (Login)
        // [HttpPost("login")]
        // public async Task<IActionResult> Login([FromBody] LoginDto dto)
        // {
        //     var user = await _context.TaiKhoan.FirstOrDefaultAsync(u => u.TenDangNhap == dto.TenDangNhap);

        //     if (user == null)
        //         return Unauthorized(new { message = "Sai tên đăng nhập hoặc mật khẩu" });

        //     // Verify mật khẩu
        //     bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.MatKhau, user.MatKhau);

        //     if (!isPasswordValid)
        //         return Unauthorized(new { message = "Sai tên đăng nhập hoặc mật khẩu" });

        //     // Nếu đúng -> trả thông tin cơ bản (sau này có thể trả JWT)
        //     return Ok(new
        //     {
        //         message = "Đăng nhập thành công",
        //         user = new { user.MaTK, user.TenDangNhap, user.VaiTro }
        //     });
        // }
    }
}
