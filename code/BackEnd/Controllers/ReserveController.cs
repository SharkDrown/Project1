using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BackEnd.Models;

namespace BackEnd.Controllers
{
    // DTO chỉ dùng cho GET/PUT/DELETE
    public class DatTruocDto
    {
        public int MaDat { get; set; }
        public int? MaDg { get; set; }
        public int? MaSach { get; set; }
        public DateOnly? NgayDat { get; set; }
        public string? TrangThai { get; set; }
        public int SoLuong { get; set; }
    }

    // DTO dùng cho POST (client chỉ gửi những gì cần)
    public class DatTruocCreateDto
    {
        public int MaSach { get; set; }
        public DateOnly? NgayDat { get; set; }
        public string? TrangThai { get; set; }
        public int SoLuong { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class DatTruocController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;

        public DatTruocController(QuanLyThuVienContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DatTruocDto>>> GetDatTruocs()
        {
            var datTruocs = await _context.DatTruocs
                                         .Select(d => new DatTruocDto
                                         {
                                             MaDat = d.MaDat,
                                             MaDg = d.MaDg,
                                             MaSach = d.MaSach,
                                             NgayDat = d.NgayDat,
                                             TrangThai = d.TrangThai,
                                             SoLuong = d.SoLuong
                                         })
                                         .ToListAsync();

            return Ok(datTruocs);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DatTruocDto>> GetDatTruoc(int id)
        {
            var datTruoc = await _context.DatTruocs
                                         .Where(d => d.MaDat == id)
                                         .Select(d => new DatTruocDto
                                         {
                                             MaDat = d.MaDat,
                                             MaDg = d.MaDg,
                                             MaSach = d.MaSach,
                                             NgayDat = d.NgayDat,
                                             TrangThai = d.TrangThai,
                                             SoLuong = d.SoLuong
                                         })
                                         .FirstOrDefaultAsync();

            if (datTruoc == null) return NotFound();
            return Ok(datTruoc);
        }

        // POST: lấy MaDG từ MaTk trong token
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<DatTruocDto>> PostDatTruoc(DatTruocCreateDto dto)
        {
            // Lấy MaTk từ token
            var maTkClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? User.FindFirst("sub")?.Value;

            if (!int.TryParse(maTkClaim, out int maTk))
                return Unauthorized(new { message = "Token không chứa mã tài khoản hợp lệ." });

            // Lấy MaDG từ TaiKhoan
            var docGia = await _context.TaiKhoans
                                       .Include(t => t.DocGium)
                                       .Where(t => t.MaTk == maTk)
                                       .Select(t => t.DocGium)
                                       .FirstOrDefaultAsync();

            if (docGia == null)
                return BadRequest(new { message = "Tài khoản chưa liên kết với độc giả." });

            var datTruoc = new DatTruoc
            {
                MaDg = docGia.MaDg,
                MaSach = dto.MaSach,
                NgayDat = dto.NgayDat,
                TrangThai = dto.TrangThai,
                SoLuong = dto.SoLuong
            };

            _context.DatTruocs.Add(datTruoc);
            await _context.SaveChangesAsync();

            var resultDto = new DatTruocDto
            {
                MaDat = datTruoc.MaDat,
                MaDg = datTruoc.MaDg,
                MaSach = datTruoc.MaSach,
                NgayDat = datTruoc.NgayDat,
                TrangThai = datTruoc.TrangThai,
                SoLuong = datTruoc.SoLuong
            };

            return CreatedAtAction(nameof(GetDatTruoc), new { id = datTruoc.MaDat }, resultDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutDatTruoc(int id, DatTruocDto dto)
        {
            if (id != dto.MaDat) return BadRequest();

            var datTruoc = await _context.DatTruocs.FindAsync(id);
            if (datTruoc == null) return NotFound();

            datTruoc.MaSach = dto.MaSach;
            datTruoc.NgayDat = dto.NgayDat;
            datTruoc.TrangThai = dto.TrangThai;
            datTruoc.SoLuong = dto.SoLuong;

            // MaDg không cho client update
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDatTruoc(int id)
        {
            var datTruoc = await _context.DatTruocs.FindAsync(id);
            if (datTruoc == null) return NotFound();

            _context.DatTruocs.Remove(datTruoc);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool DatTruocExists(int id)
        {
            return _context.DatTruocs.Any(e => e.MaDat == id);
        }
    }
}
