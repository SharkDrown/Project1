using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackEnd.Models
{
    [Table("TaiKhoan")]
    public class TaiKhoan
    {
        [Key]
        public int MaTK { get; set; }

        [Required, MaxLength(50)]
        public string TenDangNhap { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string MatKhau { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string VaiTro { get; set; } = "DocGia";

        public bool TrangThai { get; set; } = true;
    }
}
