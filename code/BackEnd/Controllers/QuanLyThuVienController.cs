using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuanLyThuVienController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;

        public QuanLyThuVienController(QuanLyThuVienContext context)
        {
            _context = context;
        }

        [HttpGet("theloai/count")] // Route: api/quanlythuvien/theloai/count
        public async Task<ActionResult<IEnumerable<TheLoaiWithCount>>> GetTheLoaiWithCounts()
        {
            var result = await _context.TheLoais
                .Select(t => new TheLoaiWithCount
                {
                    MaTl = t.MaTl,
                    TenTl = t.TenTl,
                    Count = _context.Saches.Count(s => s.MaTl == t.MaTl) // Đếm sách theo MaTL
                })
                .OrderBy(t => t.TenTl)
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<SachDto>>> GetSaches(
    string? query = null,
    int page = 1,
    int size = 9,
    [FromQuery] List<string>? theLoaiIds = null)
        {
            try
            {
                // B1: Chuẩn bị query cơ sở
                var saches = _context.Saches.AsQueryable();

                // B2: Lọc theo từ khóa (tên sách hoặc nhà xuất bản)
                if (!string.IsNullOrEmpty(query))
                {
                    string keyword = query.Trim().ToLower();
                    saches = saches.Where(s =>
                        EF.Functions.Like(s.TuaSach.ToLower(), $"%{keyword}%") ||
                        EF.Functions.Like(s.NhaXb.ToLower(), $"%{keyword}%"));
                }

                // B3: Lọc theo thể loại (nếu có)
                if (theLoaiIds != null && theLoaiIds.Any())
                {
                    saches = saches.Where(s => theLoaiIds.Contains(s.MaTl));
                }

                // B4: Đếm tổng số kết quả
                var totalCount = await saches.CountAsync();

                // B5: Phân trang
                var result = await saches
                    .OrderBy(s => s.TuaSach)
                    .Skip((page - 1) * size)
                    .Take(size)
                    .Select(s => new SachDto
                    {
                        MaSach = s.MaSach,
                        TuaSach = s.TuaSach,
                        NhaXb = s.NhaXb ?? "Không có nhà XB",
                        SoLuong = s.SoLuong
                    })
                    .ToListAsync();

                // B6: Trả kết quả về FE
                return Ok(new PagedResult<SachDto>
                {
                    Data = result,
                    TotalCount = totalCount,
                    Page = page,
                    Size = size,
                    TotalPages = (int)Math.Ceiling((double)totalCount / size)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi tìm kiếm sách",
                    error = ex.Message
                });
            }
        }
    }
}
