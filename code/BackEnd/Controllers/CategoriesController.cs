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
    }
}

