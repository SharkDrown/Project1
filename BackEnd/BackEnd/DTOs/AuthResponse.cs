namespace BackEnd.DTOs
{
    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserInfo User { get; set; } = new UserInfo();
    }

    public class UserInfo
    {
        public int MaTK { get; set; }
        public string TenDangNhap { get; set; } = string.Empty;
        public string VaiTro { get; set; } = string.Empty;
        public bool TrangThai { get; set; }
        public DocGiaInfo? DocGia { get; set; }
        public NhanVienInfo? NhanVien { get; set; }
    }

    public class DocGiaInfo
    {
        public int MaDG { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public string? DiaChi { get; set; }
        public string? Email { get; set; }
        public string? SoDT { get; set; }
    }

    public class NhanVienInfo
    {
        public int MaNV { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string? ChucVu { get; set; }
        public string? Email { get; set; }
        public string? SoDT { get; set; }
    }
}


