namespace BackEnd.Models
{
    public class RegisterDto
    {
        public string TenDangNhap { get; set; }
        public string MatKhau { get; set; }

        // Thông tin độc giả
        public string HoTen { get; set; }
        public DateOnly? NgaySinh { get; set; }
        public string DiaChi { get; set; }
        public string Email { get; set; }
        public string SoDT { get; set; }
    }
}
