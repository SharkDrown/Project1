using System.ComponentModel.DataAnnotations;

namespace BackEnd.DTOs
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Tên đăng nhập phải từ 3-50 ký tự")]
        public string TenDangNhap { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6-100 ký tự")]
        public string MatKhau { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Xác nhận mật khẩu không được để trống")]
        [Compare("MatKhau", ErrorMessage = "Mật khẩu xác nhận không khớp")]
        public string XacNhanMatKhau { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Họ tên không được để trống")]
        [StringLength(100, ErrorMessage = "Họ tên không được quá 100 ký tự")]
        public string HoTen { get; set; } = string.Empty;
        
        public DateTime? NgaySinh { get; set; }
        
        [StringLength(255, ErrorMessage = "Địa chỉ không được quá 255 ký tự")]
        public string? DiaChi { get; set; }
        
        [StringLength(20, ErrorMessage = "Số điện thoại không được quá 20 ký tự")]
        public string? SoDT { get; set; }
    }
}
