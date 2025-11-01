using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Models;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;
        private readonly ILogger<BooksController> _logger;

        public BooksController(QuanLyThuVienContext context, ILogger<BooksController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/books
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetBooks()
        {
            try
            {
                var books = await _context.Saches
                    .Include(s => s.MaTlNavigation)
                    .Select(s => new
                    {
                        maSach = s.MaSach,
                        tuaSach = s.TuaSach,
                        namXB = s.NamXb,
                        nhaXB = s.NhaXb,
                        soLuong = s.SoLuong ?? 0,
                        maTL = s.MaTl,
                        tenTL = s.MaTlNavigation != null ? s.MaTlNavigation.TenTl : null
                    })
                    .ToListAsync();

                return Ok(books);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting books");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách sách" });
            }
        }

        // GET: api/books/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetBook(int id)
        {
            try
            {
                var book = await _context.Saches
                    .Include(s => s.MaTlNavigation)
                    .Where(s => s.MaSach == id)
                    .Select(s => new
                    {
                        maSach = s.MaSach,
                        tuaSach = s.TuaSach,
                        namXB = s.NamXb,
                        nhaXB = s.NhaXb,
                        soLuong = s.SoLuong ?? 0,
                        maTL = s.MaTl,
                        tenTL = s.MaTlNavigation != null ? s.MaTlNavigation.TenTl : null
                    })
                    .FirstOrDefaultAsync();

                if (book == null)
                {
                    return NotFound(new { message = "Không tìm thấy sách" });
                }

                return Ok(book);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book with id: {Id}", id);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy thông tin sách" });
            }
        }

        // POST: api/books
        [HttpPost]
        public async Task<ActionResult<object>> CreateBook([FromBody] CreateBookDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var book = new Sach
                {
                    TuaSach = dto.TuaSach,
                    NamXb = dto.NamXB,
                    NhaXb = dto.NhaXB,
                    SoLuong = dto.SoLuong,
                    MaTl = dto.MaTL
                };

                _context.Saches.Add(book);
                await _context.SaveChangesAsync();

                var createdBook = await _context.Saches
                    .Include(s => s.MaTlNavigation)
                    .Where(s => s.MaSach == book.MaSach)
                    .Select(s => new
                    {
                        maSach = s.MaSach,
                        tuaSach = s.TuaSach,
                        namXB = s.NamXb,
                        nhaXB = s.NhaXb,
                        soLuong = s.SoLuong ?? 0,
                        maTL = s.MaTl,
                        tenTL = s.MaTlNavigation != null ? s.MaTlNavigation.TenTl : null
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetBook), new { id = book.MaSach }, createdBook);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating book");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi thêm sách" });
            }
        }

        // PUT: api/books/5
        [HttpPut("{id}")]
        public async Task<ActionResult<object>> UpdateBook(int id, [FromBody] UpdateBookDto dto)
        {
            try
            {
                if (id != dto.MaSach)
                {
                    return BadRequest(new { message = "ID không khớp" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var book = await _context.Saches.FindAsync(id);
                if (book == null)
                {
                    return NotFound(new { message = "Không tìm thấy sách" });
                }

                book.TuaSach = dto.TuaSach;
                book.NamXb = dto.NamXB;
                book.NhaXb = dto.NhaXB;
                book.SoLuong = dto.SoLuong;
                book.MaTl = dto.MaTL;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!BookExists(id))
                    {
                        return NotFound(new { message = "Không tìm thấy sách" });
                    }
                    else
                    {
                        throw;
                    }
                }

                var updatedBook = await _context.Saches
                    .Include(s => s.MaTlNavigation)
                    .Where(s => s.MaSach == id)
                    .Select(s => new
                    {
                        maSach = s.MaSach,
                        tuaSach = s.TuaSach,
                        namXB = s.NamXb,
                        nhaXB = s.NhaXb,
                        soLuong = s.SoLuong ?? 0,
                        maTL = s.MaTl,
                        tenTL = s.MaTlNavigation != null ? s.MaTlNavigation.TenTl : null
                    })
                    .FirstOrDefaultAsync();

                return Ok(updatedBook);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating book with id: {Id}", id);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi cập nhật sách" });
            }
        }

        // DELETE: api/books/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteBook(int id)
        {
            try
            {
                var book = await _context.Saches.FindAsync(id);
                if (book == null)
                {
                    return NotFound(new { message = "Không tìm thấy sách" });
                }

                _context.Saches.Remove(book);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting book with id: {Id}", id);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xóa sách. Có thể sách đang được sử dụng trong hệ thống." });
            }
        }

        private bool BookExists(int id)
        {
            return _context.Saches.Any(e => e.MaSach == id);
        }
    }

    public class CreateBookDto
    {
        public string TuaSach { get; set; } = null!;
        public int? NamXB { get; set; }
        public string? NhaXB { get; set; }
        public int SoLuong { get; set; }
        public string? MaTL { get; set; }
    }

    public class UpdateBookDto
    {
        public int MaSach { get; set; }
        public string TuaSach { get; set; } = null!;
        public int? NamXB { get; set; }
        public string? NhaXB { get; set; }
        public int SoLuong { get; set; }
        public string? MaTL { get; set; }
    }
}


