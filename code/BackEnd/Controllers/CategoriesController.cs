using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Models;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(QuanLyThuVienContext context, ILogger<CategoriesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCategories()
        {
            try
            {
                var categories = await _context.TheLoais
                    .Select(tl => new
                    {
                        maTL = tl.MaTl,
                        tenTL = tl.TenTl
                    })
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách thể loại" });
            }
        }

        // POST: api/categories
        [HttpPost]
        public async Task<ActionResult<object>> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            try
            {
                var maTl = dto.MaTL?.Trim();
                var tenTl = dto.TenTL?.Trim();

                if (string.IsNullOrWhiteSpace(maTl) || string.IsNullOrWhiteSpace(tenTl))
                {
                    return BadRequest(new { message = "Mã thể loại và tên thể loại là bắt buộc" });
                }

                var exists = await _context.TheLoais.AnyAsync(t => t.MaTl == maTl);
                if (exists)
                {
                    return Conflict(new { message = "Mã thể loại đã tồn tại" });
                }

                var category = new TheLoai
                {
                    MaTl = maTl,
                    TenTl = tenTl
                };

                _context.TheLoais.Add(category);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCategories), new { id = category.MaTl }, new
                {
                    maTL = category.MaTl,
                    tenTL = category.TenTl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category {@dto}", dto);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi thêm thể loại" });
            }
        }

        // PUT: api/categories/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<object>> UpdateCategory(string id, [FromBody] UpdateCategoryDto dto)
        {
            try
            {
                var category = await _context.TheLoais.FindAsync(id);
                if (category == null)
                {
                    return NotFound(new { message = "Không tìm thấy thể loại" });
                }

                var tenTl = dto.TenTL?.Trim();
                if (string.IsNullOrWhiteSpace(tenTl))
                {
                    return BadRequest(new { message = "Tên thể loại là bắt buộc" });
                }

                category.TenTl = tenTl;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    maTL = category.MaTl,
                    tenTL = category.TenTl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category {Id}", id);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi cập nhật thể loại" });
            }
        }

        // DELETE: api/categories/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCategory(string id)
        {
            try
            {
                var category = await _context.TheLoais.FindAsync(id);
                if (category == null)
                {
                    return NotFound(new { message = "Không tìm thấy thể loại" });
                }

                // Kiểm tra xem thể loại có đang được sử dụng trong sách không
                var isUsed = await _context.Saches.AnyAsync(s => s.MaTl == id);
                if (isUsed)
                {
                    return BadRequest(new { message = "Không thể xóa thể loại này vì đang có sách sử dụng" });
                }

                _context.TheLoais.Remove(category);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa thể loại thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category {Id}", id);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xóa thể loại" });
            }
        }
    }

    public class CreateCategoryDto
    {
        public string? MaTL { get; set; }
        public string? TenTL { get; set; }
    }

    public class UpdateCategoryDto
    {
        public string? TenTL { get; set; }
    }
}

