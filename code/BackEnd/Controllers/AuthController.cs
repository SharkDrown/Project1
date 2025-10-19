using BackEnd.Models;
using Microsoft.AspNetCore.Mvc;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;

        public AuthController(QuanLyThuVienContext context)
        {
            _context = context;
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

            // 3. Tạo mới tài khoản
            var taiKhoan = new TaiKhoan
            {
                TenDangNhap = dto.TenDangNhap,
                MatKhau = dto.MatKhau, 
                VaiTro = "DocGia",
                TrangThai = true
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
            // Tìm tài khoản
            var taiKhoan = _context.TaiKhoans.FirstOrDefault(x => x.TenDangNhap == dto.TenDangNhap);
            if (taiKhoan == null)
            {
                return BadRequest(new { message = "Tên đăng nhập không tồn tại" });
            }

            // Kiểm tra mật khẩu (trong thực tế nên hash password)
            if (taiKhoan.MatKhau != dto.MatKhau)
            {
                return BadRequest(new { message = "Mật khẩu không đúng" });
            }

            // Kiểm tra trạng thái tài khoản
            if (taiKhoan.TrangThai == false)
            {
                return BadRequest(new { message = "Tài khoản đã bị khóa" });
            }

            return Ok(new { 
                success = true,
                message = "Đăng nhập thành công",
                user = new {
                    MaTk = taiKhoan.MaTk,
                    TenDangNhap = taiKhoan.TenDangNhap,
                    VaiTro = taiKhoan.VaiTro
                }
            });
        }

        [HttpPost("create-admin")]
        public IActionResult CreateAdmin()
        {
            // Kiểm tra xem đã có admin chưa
            if (_context.TaiKhoans.Any(x => x.VaiTro == "Admin"))
            {
                return BadRequest(new { message = "Admin đã tồn tại" });
            }

            // Tạo tài khoản admin
            var admin = new TaiKhoan
            {
                TenDangNhap = "admin",
                MatKhau = "admin123",
                VaiTro = "Admin",
                TrangThai = true
            };

            _context.TaiKhoans.Add(admin);
            _context.SaveChanges();

            return Ok(new { message = "Tạo admin thành công", taiKhoan = admin });
        }
    }

    public class LoginDto
    {
        public string TenDangNhap { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
    }
}
