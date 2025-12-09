namespace BackEnd.Models
{
    // DTO dùng để trả về thông tin tài khoản
    public class AccountDto
    {
        public int MaTK { get; set; }
        public string TenDangNhap { get; set; } = string.Empty;
        public string VaiTro { get; set; } = string.Empty;
        public bool TrangThai { get; set; }

        
        public string? HoTen { get; set; }
        public DateOnly? NgaySinh { get; set; }   
        public string? DiaChi { get; set; }       
        public string? Email { get; set; }
        public string? SoDT { get; set; }
        public string? ChucVu { get; set; }       
    }

    // DTO dùng khi cập nhật thông tin
    public class UpdateAccountDto
    {
        
        public string? MatKhauCu { get; set; }
        public string? MatKhauMoi { get; set; }

        
        public string? TenDangNhap { get; set; }

        
        public string? HoTen { get; set; }
        public DateOnly? NgaySinh { get; set; }
        public string? DiaChi { get; set; }
        public string? Email { get; set; }
        public string? SoDT { get; set; }
        public string? ChucVu { get; set; }   
    }

    public class UpdateStaffDto
    {
        public int MaNV { get; set; }
        public string ChucVu { get; set; } = string.Empty;
    }
}
