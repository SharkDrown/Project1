using BackEnd.Helpers;
using BackEnd.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;
        private readonly JwtService _jwt;


        public AuthController(QuanLyThuVienContext context, JwtService jwt)
        {
            _context = context;
            _jwt = jwt;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            // 1. Kiểm tra tên đăng nhập đã tồn tại chưa
            if (_context.TaiKhoans.Any(x => x.TenDangNhap == dto.TenDangNhap))
            {
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });
            }

            // 2. Kiểm tra email đã tồn tại chưa
            if (_context.DocGia.Any(x => x.Email == dto.Email))
            {
                return BadRequest(new { message = "Email đã được sử dụng" });
            }
            

            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.MatKhau);
            // 3. Tạo mới tài khoản
            var taiKhoan = new TaiKhoan
            {
                TenDangNhap = dto.TenDangNhap,
                MatKhau = hashed,
                VaiTro = "DocGia",
                TrangThai = true,
                LastActive = DateTime.UtcNow
            };

            _context.TaiKhoans.Add(taiKhoan);
            _context.SaveChanges();

            // 4. Tạo mới độc giả liên kết với tài khoản
            var docGia = new DocGium
            {
                HoTen = dto.HoTen,
                NgaySinh = dto.NgaySinh,
                DiaChi = dto.DiaChi,
                Email = dto.Email,
                SoDt = dto.SoDT,
                MaTk = taiKhoan.MaTk
            };

            _context.DocGia.Add(docGia);
            _context.SaveChanges();

            return Ok(new { message = "Đăng ký thành công", MaDocGia = docGia.MaDg });
        }
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            var user = _context.TaiKhoans
                .AsNoTracking()
                .FirstOrDefault(x => x.TenDangNhap == dto.TenDangNhap);

            if (user == null)
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });

            var ok = BCrypt.Net.BCrypt.Verify(dto.MatKhau, user.MatKhau);
            if (!ok)
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });

            if (user.TrangThai == false)
                return BadRequest(new { message = "Tài khoản đã bị vô hiệu hóa" });

            // Cập nhật LastActive (không dùng tracking nên update nhanh)
            var tracked = _context.TaiKhoans.Find(user.MaTk);
            if (tracked != null)
            {
                tracked.LastActive = DateTime.UtcNow;
                _context.SaveChanges();
            }

            var token = _jwt.GenerateToken(user);

            var refreshToken = new RefreshToken
            {
                MaTk = user.MaTk,
                Token = TokenHelper.GenerateRefreshToken(),
                ExpiryDate = DateTime.UtcNow.AddDays(7), // hạn 7 ngày
                IsRevoked = false
            };

            _context.RefreshTokens.Add(refreshToken);
            _context.SaveChanges();

            // (Tuỳ chọn) Lưu LichSuDangNhap
            _context.LichSuDangNhaps.Add(new LichSuDangNhap
            {
                MaTk = user.MaTk,
                ThoiGian = DateTime.UtcNow,
                DiaChiIp = HttpContext.Connection.RemoteIpAddress?.ToString()
            });
            _context.SaveChanges();

            return Ok(new
            {
                access_token = token,
                refresh_token = refreshToken.Token,
                token_type = "Bearer",
                expires_in_minutes = 120
            });
        }
        [HttpPost("refresh")]
        public IActionResult Refresh([FromBody] string refreshToken)
        {
            var rt = _context.RefreshTokens
                .FirstOrDefault(x => x.Token == refreshToken 
                      && (x.IsRevoked == false || x.IsRevoked == null) 
                      && x.ExpiryDate > DateTime.UtcNow);

            if (rt == null) return Unauthorized(new { message = "Refresh token không hợp lệ hoặc đã hết hạn" });

            var user = _context.TaiKhoans.Find(rt.MaTk);
            if (user == null) return Unauthorized(new { message = "Tài khoản không tồn tại" });

            var newAccessToken = _jwt.GenerateToken(user);

            return Ok(new
            {
                access_token = newAccessToken,
                token_type = "Bearer",
                expires_in_minutes = 120
            });
        }

    }
    
}
