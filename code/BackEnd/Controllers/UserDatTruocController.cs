using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BackEnd.Models;

namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc đăng nhập
    public class UserDatTruocController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;

        public UserDatTruocController(QuanLyThuVienContext context)
        {
            _context = context;
        }

        // Lấy mã độc giả từ token chứa MaTk
        private async Task<int?> GetMaDgFromToken()
        {
            // Lấy mã tài khoản từ claim
            var maTkClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(maTkClaim, out int maTk))
                return null;

            // Lấy MaDg từ bảng DocGium
            var docGia = await _context.DocGia
                .FirstOrDefaultAsync(d => d.MaTk == maTk);

            return docGia?.MaDg;
        }

        // GET: api/UserDatTruoc/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyBorrows()
        {
            var maDg = await GetMaDgFromToken();
            if (maDg == null) return Unauthorized(new { message = "Token không hợp lệ hoặc không tìm thấy độc giả" });

            var borrows = await _context.DatTruocs
                .Where(d => d.MaDg == maDg)
                .OrderByDescending(d => d.NgayDat)
                .Select(d => new
                {
                    d.MaDat,
                    d.MaSach,
                    d.SoLuong,
                    d.TrangThai,
                    d.NgayDat
                })
                .ToListAsync();

            return Ok(borrows);
        }

        // POST: api/UserDatTruoc
        [HttpPost]
        public async Task<IActionResult> CreateBorrow([FromBody] DatTruoc borrow)
        {
            if (borrow == null || borrow.MaSach == null || borrow.SoLuong <= 0)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            var maDg = await GetMaDgFromToken();
            if (maDg == null) return Unauthorized(new { message = "Token không hợp lệ hoặc không tìm thấy độc giả" });

            var newBorrow = new DatTruoc
            {
                MaDg = maDg.Value,
                MaSach = borrow.MaSach,
                SoLuong = borrow.SoLuong,
                TrangThai = "Cho",
                NgayDat = DateOnly.FromDateTime(DateTime.Now)
            };

            _context.DatTruocs.Add(newBorrow);
            await _context.SaveChangesAsync();

            return Ok(newBorrow);
        }

        // DELETE: api/UserDatTruoc/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBorrow(int id)
        {
            var maDg = await GetMaDgFromToken();
            if (maDg == null) return Unauthorized(new { message = "Token không hợp lệ hoặc không tìm thấy độc giả" });

            var borrow = await _context.DatTruocs
                .FirstOrDefaultAsync(d => d.MaDat == id && d.MaDg == maDg);

            if (borrow == null)
                return NotFound(new { message = "Phiếu đặt không tồn tại" });

            if (borrow.TrangThai != "Cho")
                return BadRequest(new { message = "Chỉ có thể hủy phiếu còn trạng thái 'Cho'" });

            _context.DatTruocs.Remove(borrow);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/UserDatTruoc/{id}/soluong
        [HttpPut("{id}/soluong")]
        public async Task<IActionResult> UpdateQuantity(int id, [FromBody] int soLuong)
        {
            if (soLuong <= 0)
                return BadRequest(new { message = "Số lượng phải lớn hơn 0" });

            var maDg = await GetMaDgFromToken();
            if (maDg == null) return Unauthorized(new { message = "Token không hợp lệ hoặc không tìm thấy độc giả" });

            var borrow = await _context.DatTruocs
                .FirstOrDefaultAsync(d => d.MaDat == id && d.MaDg == maDg);

            if (borrow == null)
                return NotFound(new { message = "Phiếu đặt không tồn tại" });

            if (borrow.TrangThai != "Cho")
                return BadRequest(new { message = "Chỉ có thể cập nhật phiếu còn trạng thái 'Cho'" });

            borrow.SoLuong = soLuong;
            await _context.SaveChangesAsync();

            return Ok(borrow);
        }
    }
}
