using BackEnd.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CuonSachController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;

        public CuonSachController(QuanLyThuVienContext context)
        {
            _context = context;
        }
        [HttpGet("by-masach/{maSach}")]
        public async Task<IActionResult> GetCuonSachByMaSach(int maSach)
        {
            var result = await _context.CuonSaches
                .Where(c => c.MaSach == maSach)
                .OrderBy(c => c.MaVach)
                .Select(c => new
                {
                    c.MaVach,
                    c.MaSach,
                    c.TinhTrang,
                    c.MaDat
                })
                .ToListAsync();

            return Ok(result);
        }

        // ===============================
        // 2️⃣ Cập nhật tình trạng 1 cuốn sách
        // ===============================
        // PUT: api/CuonSach/{maVach}/status
        // Trong CuonSachController.cs

        // PUT: api/CuonSach/{maVach}/status
        [HttpPut("{maVach}/status")]
        public async Task<IActionResult> UpdateTinhTrang(string maVach, [FromBody] UpdateTinhTrangRequest req)
        {
            var book = await _context.CuonSaches.FindAsync(maVach);
            if (book == null)
                return NotFound();

            book.TinhTrang = req.TinhTrang;

            // GÁN CHỦ SỞ HỮU MỚI (QUAN TRỌNG NHẤT)
            // Nếu duyệt, MaDat sẽ là ID đơn đặt. Nếu hoàn tác, MaDat sẽ là NULL.
            book.MaDat = req.MaDat; // <--- THÊM DÒNG NÀY

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.CuonSaches.Any(e => e.MaVach == maVach))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new
            {
                message = "Cập nhật thành công!",
                maVach = book.MaVach,
                tinhTrang = book.TinhTrang,
                maDat = book.MaDat // Trả về MaDat để Frontend có thể xác nhận
            });
        }
    }
    public class UpdateTinhTrangRequest
    {
        public string TinhTrang { get; set; } = string.Empty;
        public int? MaDat { get; set; }
    }
}
