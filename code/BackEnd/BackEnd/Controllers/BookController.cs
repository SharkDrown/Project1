using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Models;

namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SachesController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;

        public SachesController(QuanLyThuVienContext context)
        {
            _context = context;
        }

        // ===============================
        // GET: api/Saches
        // ===============================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var list = await _context.Saches
                .Select(s => new
                {
                    s.MaSach,
                    s.MaTl,
                    MaCuon = s.CuonSaches.Select(c => c.MaVach),
                    MaDanhGia = s.DanhGiaSaches.Select(d => d.MaDg),
                    MaDatTruoc = s.DatTruocs.Select(dt => dt.MaDat),
                    MaTacGia = s.MaTgs.Select(tg => tg.MaTg)
                })
                .ToListAsync();

            return Ok(list);
        }

        // ===============================
        // GET: api/Saches/5
        // ===============================
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetById(int id)
        {
            var sach = await _context.Saches
                .Where(s => s.MaSach == id)
                .Select(s => new
                {
                    s.MaSach,
                    s.MaTl,
                    MaCuon = s.CuonSaches.Select(c => c.MaVach),
                    MaDanhGia = s.DanhGiaSaches.Select(d => d.MaDg),
                    MaDatTruoc = s.DatTruocs.Select(dt => dt.MaDat),
                    MaTacGia = s.MaTgs.Select(tg => tg.MaTg)
                })
                .FirstOrDefaultAsync();

            if (sach == null)
                return NotFound(new { message = "Không tìm thấy sách" });

            return Ok(sach);
        }

        // ===============================
        // POST: api/Saches
        // ===============================
        [HttpPost]
        public async Task<ActionResult<object>> Create([FromBody] Sach sach)
        {
            if (sach == null)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            _context.Saches.Add(sach);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = sach.MaSach }, new { sach.MaSach, sach.MaTl });
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

            return Ok(new { message = "Cập nhật sách thành công", existing.MaSach, existing.MaTl });
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

            return Ok(new { message = "Xóa sách thành công", sach.MaSach });
        }
    }
}
