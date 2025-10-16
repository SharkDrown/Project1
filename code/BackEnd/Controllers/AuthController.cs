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
    }
}
