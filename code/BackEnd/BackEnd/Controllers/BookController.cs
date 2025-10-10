using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Models;

namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SachesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SachesController(AppDbContext context)
        {
            _context = context;
        }

        // ===============================
        // GET: api/Saches
        // ===============================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sach>>> GetAll()
        {
            var list = await _context.Saches
                .Include(s => s.MaTlNavigation) // nếu muốn lấy thêm thể loại
                .ToListAsync();
            return Ok(list);
        }

        // ===============================
        // GET: api/Saches/5
        // ===============================
        [HttpGet("{id}")]
        public async Task<ActionResult<Sach>> GetById(int id)
        {
            var sach = await _context.Saches
                .FirstOrDefaultAsync(s => s.MaSach == id);

            if (sach == null)
                return NotFound(new { message = "Không tìm thấy sách" });

            return Ok(sach);
        }

        // ===============================
        // POST: api/Saches
        // ===============================
        [HttpPost]
        public async Task<ActionResult<Sach>> Create([FromBody] Sach sach)
        {
            if (sach == null)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            _context.Saches.Add(sach);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = sach.MaSach }, sach);
        }

        // ===============================
        // PUT: api/Saches/5
        // ===============================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Sach sach)
        {
            if (id != sach.MaSach)
                return BadRequest(new { message = "Mã sách không khớp" });

            var existing = await _context.Saches.FindAsync(id);
            if (existing == null)
                return NotFound(new { message = "Không tìm thấy sách cần cập nhật" });

            // cập nhật thủ công các trường
            existing.TuaSach = sach.TuaSach;
            existing.NamXb = sach.NamXb;
            existing.NhaXb = sach.NhaXb;
            existing.SoLuong = sach.SoLuong;
            existing.MaTl = sach.MaTl;
            existing.GioiThieu = sach.GioiThieu;

            _context.Entry(existing).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật sách thành công" });
        }

        // ===============================
        // DELETE: api/Saches/5
        // ===============================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var sach = await _context.Saches.FindAsync(id);
            if (sach == null)
                return NotFound(new { message = "Không tìm thấy sách cần xóa" });

            _context.Saches.Remove(sach);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa sách thành công" });
        }
    }
}
