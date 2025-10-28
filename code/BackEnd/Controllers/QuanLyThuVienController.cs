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
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var sach = _context.Saches.FirstOrDefault(s => s.MaSach == id);
            if (sach == null)
            {
                return NotFound(new { message = $"Không tìm thấy sách có mã {id}" });
            }
            return Ok(sach);
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
        // 📘 Lấy danh sách đánh giá của 1 cuốn sách
        [HttpGet("danhgia/{maSach}")]
        public async Task<IActionResult> GetDanhGiaTheoSach(int maSach)
        {
            var danhGias = await _context.DanhGiaSaches
                .Include(d => d.MaDgNavigation)
                .Where(d => d.MaSach == maSach)
                .OrderByDescending(d => d.NgayDg)
                .Select(d => new
                {
                    d.MaDg,
                    HoTen = d.MaDgNavigation.HoTen,
                    d.SoSao,
                    d.BinhLuan,
                    NgayDg = d.NgayDg,
                })
                .ToListAsync();

            return Ok(danhGias);
        }

        // 📝 Thêm mới 1 đánh giá sách
        [HttpPost("danhgia")]
        public async Task<IActionResult> PostDanhGia([FromBody] DanhGiaSach danhGia)
        {
            Console.WriteLine("Dữ liệu nhận được:");
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(danhGia));
            if (danhGia == null || danhGia.MaSach <= 0 || danhGia.MaDg <= 0)
            {
                return BadRequest(new { message = "Dữ liệu đánh giá không hợp lệ." });
            }

            // Kiểm tra đã từng đánh giá chưa
            var existing = await _context.DanhGiaSaches
                .FirstOrDefaultAsync(d => d.MaSach == danhGia.MaSach && d.MaDg == danhGia.MaDg);

            if (existing != null)
            {
                // Cập nhật nếu đã có
                existing.SoSao = danhGia.SoSao;
                existing.BinhLuan = danhGia.BinhLuan;
                existing.NgayDg = DateOnly.FromDateTime(DateTime.Now);

                _context.DanhGiaSaches.Update(existing);
            }
            else
            {
                // Thêm mới
                danhGia.NgayDg = DateOnly.FromDateTime(DateTime.Now);
                _context.DanhGiaSaches.Add(danhGia);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đánh giá thành công!" });
        }
        [HttpDelete("danhgia/{maSach}/{maDg}")]
        public async Task<IActionResult> DeleteDanhGia(int maSach, int maDg)
        {
            var review = await _context.DanhGiaSaches
                .FirstOrDefaultAsync(d => d.MaSach == maSach && d.MaDg == maDg);

            if (review == null)
            {
                return NotFound(new { message = "Không tìm thấy đánh giá." });
            }

            _context.DanhGiaSaches.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đánh giá đã được xóa." });
        }

    }
}
