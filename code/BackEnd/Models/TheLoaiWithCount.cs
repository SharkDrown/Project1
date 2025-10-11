namespace BackEnd.Models
{
    public class TheLoaiWithCount
    {
        public string MaTl { get; set; } = string.Empty;
        public string TenTl { get; set; } = string.Empty;
        public int Count { get; set; } // Số sách thuộc thể loại
    }
}
