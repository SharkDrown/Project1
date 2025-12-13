using System.ComponentModel.DataAnnotations;

namespace BackEnd.Models

{
    public class FineTicketDto
    {
        [Required]
        public int MaPm { get; set; }

        [Required]
        [MaxLength(255)]
        public string LyDo { get; set; } = string.Empty;

        [Required]
        public decimal SoTien { get; set; }
    }
}
