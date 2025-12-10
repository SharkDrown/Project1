using BackEnd.Helpers;
using BackEnd.Models;
using Microsoft.AspNetCore.Authorization;
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
        [HttpPost("create-staff")]
        [Authorize(Roles = "Admin")]
        public IActionResult CreateStaff([FromBody] RegisterDto dto)
        {
            
            if (string.IsNullOrWhiteSpace(dto.TenDangNhap) || string.IsNullOrWhiteSpace(dto.MatKhau))
                return BadRequest(new { message = "Tên đăng nhập và mật khẩu là bắt buộc" });

            if (dto.VaiTro != null && dto.VaiTro != "NhanVien")
                return BadRequest(new { message = "API này chỉ được dùng để tạo tài khoản nhân viên" });

            
            if (_context.TaiKhoans.Any(x => x.TenDangNhap == dto.TenDangNhap))
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });

            
            if (!string.IsNullOrEmpty(dto.Email) && _context.NhanViens.Any(x => x.Email == dto.Email))
                return BadRequest(new { message = "Email đã được sử dụng" });

            
            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.MatKhau);

            //  Tạo tài khoản
            var taiKhoan = new TaiKhoan
            {
                TenDangNhap = dto.TenDangNhap,
                MatKhau = hashed,
                VaiTro = "NhanVien",
                TrangThai = true,
                LastActive = DateTime.UtcNow
            };
            _context.TaiKhoans.Add(taiKhoan);
            _context.SaveChanges();

            //  Tạo nhân viên liên kết
            var nhanVien = new NhanVien
            {
                HoTen = dto.HoTen ?? "Chưa cập nhật",
                ChucVu = dto.ChucVu ?? "Nhân viên",
                Email = dto.Email,
                SoDt = dto.SoDT,
                MaTk = taiKhoan.MaTk
            };
            _context.NhanViens.Add(nhanVien);
            _context.SaveChanges();

            return Ok(new
            {
                message = "Tạo tài khoản nhân viên thành công",
                MaNhanVien = nhanVien.MaNv,
                VaiTro = "NhanVien"
            });
        }


        // Tạo tài khoản ADMIN khác
        [HttpPost("create-admin")]
        [Authorize(Roles = "Admin")]
        public IActionResult CreateAdmin([FromBody] RegisterDto dto)
        {
           
            if (string.IsNullOrWhiteSpace(dto.TenDangNhap) || string.IsNullOrWhiteSpace(dto.MatKhau))
                return BadRequest(new { message = "Tên đăng nhập và mật khẩu là bắt buộc" });

            if (dto.VaiTro != null && dto.VaiTro != "Admin")
                return BadRequest(new { message = "API này chỉ được dùng để tạo tài khoản Admin" });

          
            if (_context.TaiKhoans.Any(x => x.TenDangNhap == dto.TenDangNhap))
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });

    
            if (!string.IsNullOrEmpty(dto.Email) && _context.NhanViens.Any(x => x.Email == dto.Email))
                return BadRequest(new { message = "Email đã được sử dụng" });

            

            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.MatKhau);

            // Tạo tài khoản admin
            var taiKhoan = new TaiKhoan
            {
                TenDangNhap = dto.TenDangNhap,
                MatKhau = hashed,
                VaiTro = "Admin",
                TrangThai = true,
                LastActive = DateTime.UtcNow
            };
            _context.TaiKhoans.Add(taiKhoan);
            _context.SaveChanges();

            // Tạo nhân viên liên kết (Admin cũng nằm trong bảng NhanVien)
            var admin = new NhanVien
            {
                HoTen = dto.HoTen ?? "Quản trị viên mới",
                ChucVu = dto.ChucVu ?? "Admin",
                Email = dto.Email,
                SoDt = dto.SoDT,
                MaTk = taiKhoan.MaTk
            };
            _context.NhanViens.Add(admin);
            _context.SaveChanges();

            return Ok(new
            {
                message = "Tạo tài khoản Admin mới thành công",
                MaNhanVien = admin.MaNv,
                VaiTro = "Admin"
            });
        }
    
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            var user = _context.TaiKhoans
                .AsNoTracking()
                .FirstOrDefault(x => x.TenDangNhap == dto.TenDangNhap);

            if (user == null)
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });

            // Hỗ trợ cả plain text và BCrypt để tương thích với dữ liệu cũ
            // Thử verify bằng BCrypt trước
            bool ok = false;
            bool isPlainText = false;
            
            try
            {
                // Nếu mật khẩu trong DB là BCrypt hash (bắt đầu bằng $2a$ hoặc $2b$)
                if (user.MatKhau != null && (user.MatKhau.StartsWith("$2a$") || user.MatKhau.StartsWith("$2b$")))
                {
                    ok = BCrypt.Net.BCrypt.Verify(dto.MatKhau, user.MatKhau);
                }
                else
                {
                    // Mật khẩu là plain text - so sánh trực tiếp
                    ok = user.MatKhau == dto.MatKhau;
                    isPlainText = ok; // Đánh dấu để hash lại sau
                }
            }
            catch
            {
                // Nếu BCrypt verify lỗi, thử so sánh plain text
                ok = user.MatKhau == dto.MatKhau;
                isPlainText = ok;
            }

            if (!ok)
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });

            if (user.TrangThai == false)
                return BadRequest(new { message = "Tài khoản đã bị vô hiệu hóa" });

            // Cập nhật LastActive và hash lại mật khẩu nếu cần (không dùng tracking nên update nhanh)
            var tracked = _context.TaiKhoans.Find(user.MaTk);
            if (tracked != null)
            {
                // Nếu mật khẩu là plain text và đúng, tự động hash lại và lưu vào DB
                if (isPlainText)
                {
                    tracked.MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.MatKhau);
                }
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
                expires_in_minutes = 120,
                role = user.VaiTro
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

    public class LoginDto
    {
        public string TenDangNhap { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
    }


}
