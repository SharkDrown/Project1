using System.ComponentModel.DataAnnotations;

namespace BackEnd.Dtos
{
    public class RegisterDto
    {
        [Required, MaxLength(50)]
        public string TenDangNhap { get; set; } = string.Empty;

        [Required, MinLength(8)]
        public string MatKhau { get; set; } = string.Empty;

        [MaxLength(20)]
        public string VaiTro { get; set; } = "DocGia";
    }
}
