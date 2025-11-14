namespace BackEnd.Models
{
    public class RegisterDto
    {

        public string TenDangNhap { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;


        public string VaiTro { get; set; } = "DocGia";


        public string? HoTen { get; set; }
        public DateOnly? NgaySinh { get; set; }
        public string? DiaChi { get; set; }
        public string? Email { get; set; }
        public string? SoDT { get; set; }

 
        public string? ChucVu { get; set; }
    }
}
