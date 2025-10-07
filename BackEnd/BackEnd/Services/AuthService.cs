using Microsoft.EntityFrameworkCore;
using BackEnd.Models;
using BackEnd.DTOs;
using BCrypt.Net;

namespace BackEnd.Services
{
    public class AuthService : IAuthService
    {
        private readonly QuanLyThuVienContext _context;
        private readonly IJwtService _jwtService;

        public AuthService(QuanLyThuVienContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<AuthResponse?> LoginAsync(LoginRequest request, string? ipAddress)
        {
            var taiKhoan = await _context.TaiKhoans
                .Include(t => t.DocGium)
                .Include(t => t.NhanVien)
                .FirstOrDefaultAsync(t => t.TenDangNhap == request.TenDangNhap && t.TrangThai == true);

            if (taiKhoan == null)
            {
                return null;
            }

            // Check password - handle both plain text and BCrypt hashed passwords
            bool isPasswordValid = false;
            try
            {
                // Try BCrypt verification first
                isPasswordValid = BCrypt.Net.BCrypt.Verify(request.MatKhau, taiKhoan.MatKhau);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                // If BCrypt fails, try plain text comparison (for existing data)
                isPasswordValid = request.MatKhau == taiKhoan.MatKhau;
                
                // If plain text matches, update to BCrypt hash
                if (isPasswordValid)
                {
                    taiKhoan.MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhau);
                    _context.TaiKhoans.Update(taiKhoan);
                    await _context.SaveChangesAsync();
                }
            }

            if (!isPasswordValid)
            {
                return null;
            }

            // Log login history
            await LogLoginHistory(taiKhoan.MaTk, ipAddress);

            var token = _jwtService.GenerateToken(taiKhoan);
            var refreshToken = _jwtService.GenerateRefreshToken();

            return new AuthResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.Now.AddHours(8), // 8 hours
                User = new UserInfo
                {
                    MaTK = taiKhoan.MaTk,
                    TenDangNhap = taiKhoan.TenDangNhap,
                    VaiTro = taiKhoan.VaiTro,
                    TrangThai = taiKhoan.TrangThai ?? false,
                    DocGia = taiKhoan.DocGium != null ? new DocGiaInfo
                    {
                        MaDG = taiKhoan.DocGium.MaDg,
                        HoTen = taiKhoan.DocGium.HoTen,
                        NgaySinh = taiKhoan.DocGium.NgaySinh.HasValue ? taiKhoan.DocGium.NgaySinh.Value.ToDateTime(TimeOnly.MinValue) : null,
                        DiaChi = taiKhoan.DocGium.DiaChi,
                        Email = taiKhoan.DocGium.Email,
                        SoDT = taiKhoan.DocGium.SoDt
                    } : null,
                    NhanVien = taiKhoan.NhanVien != null ? new NhanVienInfo
                    {
                        MaNV = taiKhoan.NhanVien.MaNv,
                        HoTen = taiKhoan.NhanVien.HoTen,
                        ChucVu = taiKhoan.NhanVien.ChucVu,
                        Email = taiKhoan.NhanVien.Email,
                        SoDT = taiKhoan.NhanVien.SoDt
                    } : null
                }
            };
        }

        public async Task<AuthResponse?> RegisterAsync(RegisterRequest request, string? ipAddress)
        {
            // Check if username or email already exists
            if (await IsUsernameExistsAsync(request.TenDangNhap))
            {
                throw new InvalidOperationException("Tên đăng nhập đã tồn tại");
            }

            if (await IsEmailExistsAsync(request.Email))
            {
                throw new InvalidOperationException("Email đã tồn tại");
            }

            // Create new account
            var taiKhoan = new TaiKhoan
            {
                TenDangNhap = request.TenDangNhap,
                MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhau),
                VaiTro = "DocGia",
                TrangThai = true
            };

            _context.TaiKhoans.Add(taiKhoan);
            await _context.SaveChangesAsync();

            // Create DocGia record
            var docGia = new DocGium
            {
                HoTen = request.HoTen,
                NgaySinh = request.NgaySinh.HasValue ? DateOnly.FromDateTime(request.NgaySinh.Value) : null,
                DiaChi = request.DiaChi,
                Email = request.Email,
                SoDt = request.SoDT,
                MaTk = taiKhoan.MaTk
            };

            _context.DocGia.Add(docGia);
            await _context.SaveChangesAsync();

            // Log login history
            await LogLoginHistory(taiKhoan.MaTk, ipAddress);

            var token = _jwtService.GenerateToken(taiKhoan);
            var refreshToken = _jwtService.GenerateRefreshToken();

            return new AuthResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.Now.AddHours(8),
                User = new UserInfo
                {
                    MaTK = taiKhoan.MaTk,
                    TenDangNhap = taiKhoan.TenDangNhap,
                    VaiTro = taiKhoan.VaiTro,
                    TrangThai = taiKhoan.TrangThai ?? false,
                    DocGia = new DocGiaInfo
                    {
                        MaDG = docGia.MaDg,
                        HoTen = docGia.HoTen,
                        NgaySinh = docGia.NgaySinh.HasValue ? docGia.NgaySinh.Value.ToDateTime(TimeOnly.MinValue) : null,
                        DiaChi = docGia.DiaChi,
                        Email = docGia.Email,
                        SoDT = docGia.SoDt
                    }
                }
            };
        }

        public async Task<bool> LogoutAsync(int maTK)
        {
            // In a real application, you might want to blacklist the token
            // For now, we'll just return true
            return await Task.FromResult(true);
        }

        public async Task<bool> IsUsernameExistsAsync(string tenDangNhap)
        {
            return await _context.TaiKhoans.AnyAsync(t => t.TenDangNhap == tenDangNhap);
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _context.DocGia.AnyAsync(d => d.Email == email) ||
                   await _context.NhanViens.AnyAsync(n => n.Email == email);
        }

        private async Task LogLoginHistory(int maTK, string? ipAddress)
        {
            var loginHistory = new LichSuDangNhap
            {
                MaTk = maTK,
                ThoiGian = DateTime.Now,
                DiaChiIp = ipAddress
            };

            _context.LichSuDangNhaps.Add(loginHistory);
            await _context.SaveChangesAsync();
        }
    }
}
