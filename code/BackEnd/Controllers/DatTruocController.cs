using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Models;

namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatTruocController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;

        public DatTruocController(QuanLyThuVienContext context)
        {
            _context = context;
        }

        // GET: api/DatTruoc/admin
        [HttpGet("admin")]
        public async Task<IActionResult> GetAllBorrows()
        {
            var borrows = await _context.DatTruocs
                .OrderBy(d => d.MaDat)
                .Select(d => new
                {
                    d.MaDat,
                    d.MaDg,
                    d.MaSach,
                    d.SoLuong,
                    d.NgayDat,
                    d.TrangThai
                })
                .ToListAsync();

            return Ok(borrows);
        }
        // GET: api/DatTruoc/mavach/{maSach}
        [HttpGet("mavach/{maSach}")]
        public async Task<IActionResult> GetAvailableCopies(int maSach)
        {
            var copies = await _context.CuonSaches
                .Where(c => c.MaSach == maSach)
                .Select(c => new
                {
                    c.MaVach,
                    c.MaSach,
                    c.TinhTrang,  // "Tot" hoặc "DangMuon"
                    c.MaDat
                })
                .ToListAsync();

            return Ok(copies);
        }
        // POST: api/DatTruoc/admin
        [HttpPost("admin")]
        public async Task<IActionResult> CreateBorrow([FromBody] DatTruoc model)
        {
            if (model == null) return BadRequest();

            var newItem = new DatTruoc
            {
                MaDg = model.MaDg,
                MaSach = model.MaSach,
                SoLuong = model.SoLuong,  // người dùng nhập
                TrangThai = "Cho",
                NgayDat = DateOnly.FromDateTime(DateTime.Now)
            };

            _context.DatTruocs.Add(newItem);
            await _context.SaveChangesAsync();

            return Ok(newItem);
        }


        // PUT: api/DatTruoc/admin/{id}/status
        [HttpPut("admin/{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string trangThai)
        {
            var borrow = await _context.DatTruocs.FindAsync(id);
            if (borrow == null) return NotFound();

            borrow.TrangThai = trangThai;
            await _context.SaveChangesAsync();

            return Ok(borrow);
        }

        // DELETE: api/DatTruoc/admin/{id}
        [HttpDelete("admin/{id}")]
        public async Task<IActionResult> DeleteBorrow(int id)
        {
            var borrow = await _context.DatTruocs.FindAsync(id);
            if (borrow == null) return NotFound();

            _context.DatTruocs.Remove(borrow);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        // PUT: api/DatTruoc/admin/{id}/duyet
        [HttpPut("admin/{id}/duyet")]
        public async Task<IActionResult> DuyetYeuCau(int id)
        {
            var yeuCau = await _context.DatTruocs.FindAsync(id);
            if (yeuCau == null) return NotFound();

            // Lấy đủ số lượng mã vạch còn tốt
            var danhSachCuon = await _context.CuonSaches
                .Where(c => c.MaSach == yeuCau.MaSach && c.TinhTrang == "Tot")
                .Take(yeuCau.SoLuong)
                .ToListAsync();

            if (danhSachCuon.Count < yeuCau.SoLuong)
            {
                return BadRequest(new { message = "Không đủ sách tồn kho để duyệt yêu cầu." });
            }

            // Cập nhật trạng thái từng cuốn
            foreach (var cuon in danhSachCuon)
            {
                cuon.TinhTrang = "DangMuon"; 
                cuon.MaDat = id;
            }

            yeuCau.TrangThai = "DaNhan";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Duyệt thành công"
               
            });
        }



    }
}
