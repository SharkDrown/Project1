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

        [HttpGet("theloai/count")] 
        public async Task<ActionResult<IEnumerable<TheLoaiWithCount>>> GetTheLoaiWithCounts()
        {
            var result = await _context.TheLoais
                .Select(t => new TheLoaiWithCount
                {
                    MaTl = t.MaTl,
                    TenTl = t.TenTl,
                    Count = _context.Saches.Count(s => s.MaTl == t.MaTl) 
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
                
                var saches = _context.Saches
                 .Include(s => s.TacGia) 
                 .AsQueryable();

                
                if (!string.IsNullOrEmpty(query))
                {
                    string keyword = query.Trim().ToLower();
                    saches = saches.Where(s =>
                        EF.Functions.Like(s.TuaSach.ToLower(), $"%{keyword}%") ||
                        s.TacGia.Any(t => EF.Functions.Like(t.TenTg.ToLower(), $"%{keyword}%")));
                }

               
                if (theLoaiIds != null && theLoaiIds.Any())
                {
                    saches = saches.Where(s => theLoaiIds.Contains(s.MaTl));
                }

                
                var totalCount = await saches.CountAsync();

               
                var result = await saches
                    .Include(s => s.TacGia) 
                    .OrderBy(s => s.TuaSach)
                    .Skip((page - 1) * size)
                    .Take(size)
                    .Select(s => new SachDto
                    {
                        MaSach = s.MaSach,
                        TuaSach = s.TuaSach,
                        TenTg = s.TacGia.Any()
                            ? string.Join(", ", s.TacGia.Select(t => t.TenTg))
                            : "Không có tác giả",
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
