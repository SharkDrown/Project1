namespace BackEnd.Models
{
    public class AccountDto
    {
        public int MaTK { get; set; }
        public string TenDangNhap { get; set; } = string.Empty;
        public string VaiTro { get; set; } = string.Empty;
        public bool TrangThai { get; set; }
    }

    public class UpdateAccountDto
{
    // Thay đổi mật khẩu
    public string? MatKhauCu { get; set; }
    public string? MatKhauMoi { get; set; }
    public string? TenDangNhap { get; set; } 

    // Thông tin độc giả
    public string? HoTen { get; set; }
    public DateOnly? NgaySinh { get; set; }
    public string? DiaChi { get; set; }
    public string? Email { get; set; }
    public string? SoDT { get; set; }
}
}
