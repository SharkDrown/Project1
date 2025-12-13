using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BackEnd.Models;
using System.Text.RegularExpressions;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NoticesController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;
        private readonly ILogger<NoticesController> _logger;

        public NoticesController(QuanLyThuVienContext context, ILogger<NoticesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/notices/my - Lấy thông báo của tài khoản hiện tại
        [HttpGet("my")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetMyNotices()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst("sub")?.Value;
                
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int maTk))
                {
                    return Unauthorized(new { message = "Không xác định được tài khoản" });
                }

                var notices = await _context.ThongBaos
                    .Where(tb => tb.MaTk == maTk)
                    .OrderByDescending(tb => tb.NgayTb)
                    .Select(tb => new
                    {
                        maTb = tb.MaTb,
                        noiDung = tb.NoiDung,
                        ngayTb = tb.NgayTb.HasValue ? tb.NgayTb.Value.ToString("yyyy-MM-dd") : null,
                        maTk = tb.MaTk,

                    })
                    .ToListAsync();
                var result = notices.Select(tb => {

                    string trangThai = "N/A"; // Mặc định cho thông báo thường
                    int? maPp = null;

                    // Kiểm tra xem đây có phải là Phiếu phạt không
                    if (tb.noiDung != null && tb.noiDung.StartsWith("[PHAT] Mã PP:"))
                    {
                        // Sử dụng Regex để trích xuất MaPp từ NoiDung (Giống logic ở Frontend)
                        var match = Regex.Match(tb.noiDung, @"\[PHAT\] Mã PP: (\d+).*");

                        if (match.Success && int.TryParse(match.Groups[1].Value, out int fineId))
                        {
                            maPp = fineId;

                            // Tra cứu trạng thái Phiếu phạt trong DB
                            // Dùng .FirstOrDefault() (đồng bộ) vì nó nằm trong một khối Select, 
                            // cách này là thực tế nhất khi không có FK giữa hai bảng
                            var phieuPhat = _context.PhieuPhats.FirstOrDefault(pp => pp.MaPp == fineId);

                            // Gán trạng thái đã tìm thấy, nếu không tìm thấy coi như Chưa đóng (hoặc N/A)
                            trangThai = phieuPhat?.TrangThai ?? "ChuaDong";
                        }
                    }

                    // Trả về một đối tượng ẩn danh (Anonymous Object) có thêm trường 'trangThai'
                    return new
                    {
                        maTb = tb.maTb,
                        noiDung = tb.noiDung,
                        ngayTb = tb.ngayTb,
                        maTk = tb.maTk,

                        // ⭐️ THÊM TRẠNG THÁI VÀO JSON TRẢ VỀ CHO FRONTEND ⭐️
                        trangThai = trangThai
                    };
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting my notices");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy thông báo", error = ex.Message });
            }
        }

        // GET: api/notices - Lấy tất cả thông báo (chỉ admin)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllNotices()
        {
            try
            {
                var notices = await _context.ThongBaos
                    .Include(tb => tb.MaTkNavigation)
                    .OrderByDescending(tb => tb.NgayTb)
                    .Select(tb => new
                    {
                        maTb = tb.MaTb,
                        noiDung = tb.NoiDung,
                        ngayTb = tb.NgayTb.HasValue ? tb.NgayTb.Value.ToString("yyyy-MM-dd") : null,
                        maTk = tb.MaTk,
                        tenDangNhap = tb.MaTkNavigation != null ? tb.MaTkNavigation.TenDangNhap : null
                    })
                    .ToListAsync();

                return Ok(notices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all notices");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách thông báo" });
            }
        }

        // POST: api/notices - Tạo thông báo mới
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> CreateNotice([FromBody] CreateNoticeDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.NoiDung))
                {
                    return BadRequest(new { message = "Nội dung thông báo không được để trống" });
                }

                // Kiểm tra độ dài (giới hạn 500 ký tự theo database)
                if (dto.NoiDung.Length > 500)
                {
                    return BadRequest(new { message = $"Nội dung thông báo không được vượt quá 500 ký tự. Hiện tại: {dto.NoiDung.Length} ký tự." });
                }

                var notice = new ThongBao
                {
                    NoiDung = dto.NoiDung,
                    NgayTb = DateOnly.FromDateTime(DateTime.Now),
                    MaTk = dto.MaTk
                };

                _context.ThongBaos.Add(notice);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    maTb = notice.MaTb,
                    noiDung = notice.NoiDung,
                    ngayTb = notice.NgayTb.HasValue ? notice.NgayTb.Value.ToString("yyyy-MM-dd") : null,
                    maTk = notice.MaTk
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notice");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tạo thông báo" });
            }
        }

        // POST: api/notices/multiple - Gửi thông báo cho nhiều tài khoản
        [HttpPost("multiple")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreateMultipleNotices([FromBody] CreateNoticeDto[] dtos)
        {
            try
            {
                _logger.LogInformation("Nhận request gửi thông báo hàng loạt, số lượng: {Count}", dtos?.Length ?? 0);
                
                if (dtos == null || dtos.Length == 0)
                {
                    _logger.LogWarning("Danh sách thông báo rỗng");
                    return BadRequest(new { message = "Danh sách thông báo không được để trống" });
                }

                // Validate từng thông báo
                foreach (var dto in dtos)
                {
                    if (string.IsNullOrWhiteSpace(dto.NoiDung))
                    {
                        _logger.LogWarning("Nội dung thông báo rỗng cho tài khoản {MaTk}", dto.MaTk);
                        return BadRequest(new { message = $"Nội dung thông báo không được để trống cho tài khoản {dto.MaTk}" });
                    }
                    if (dto.NoiDung.Length > 500)
                    {
                        _logger.LogWarning("Nội dung thông báo quá dài cho tài khoản {MaTk}: {Length} ký tự", dto.MaTk, dto.NoiDung.Length);
                        return BadRequest(new { message = $"Nội dung thông báo không được vượt quá 500 ký tự. Hiện tại: {dto.NoiDung.Length} ký tự." });
                    }
                    if (!dto.MaTk.HasValue || dto.MaTk.Value <= 0)
                    {
                        _logger.LogWarning("Mã tài khoản không hợp lệ: {MaTk}", dto.MaTk);
                        return BadRequest(new { message = $"Mã tài khoản không hợp lệ: {dto.MaTk}" });
                    }
                }

                var today = DateOnly.FromDateTime(DateTime.Now);
                var notices = dtos.Select(dto => new ThongBao
                {
                    NoiDung = dto.NoiDung,
                    NgayTb = today,
                    MaTk = dto.MaTk
                }).ToList();

                _logger.LogInformation("Đang thêm {Count} thông báo vào database", notices.Count);
                _context.ThongBaos.AddRange(notices);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Đã gửi {Count} thông báo thành công", notices.Count);
                return Ok(new { message = $"Đã gửi {notices.Count} thông báo thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating multiple notices. InnerException: {InnerException}", ex.InnerException?.Message);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi gửi thông báo", error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }

        // DELETE: api/notices/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNotice(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst("sub")?.Value;
                
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int maTk))
                {
                    return Unauthorized(new { message = "Không xác định được tài khoản" });
                }

                var notice = await _context.ThongBaos.FindAsync(id);
                if (notice == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông báo" });
                }

                // Chỉ cho phép xóa thông báo của chính mình hoặc admin có thể xóa tất cả
                var isAdmin = User.IsInRole("Admin");
                if (!isAdmin && notice.MaTk != maTk)
                {
                    return Forbid();
                }

                _context.ThongBaos.Remove(notice);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa thông báo thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notice");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xóa thông báo" });
            }
        }

        // GET: api/notices/accounts/{role} - Lấy danh sách tài khoản theo vai trò
        [HttpGet("accounts/{role}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetAccountsByRole(string role)
        {
            try
            {
                var accounts = new List<object>();

                if (role.ToLower() == "admin")
                {
                    accounts = await _context.TaiKhoans
                        .Include(tk => tk.NhanVien)
                        .Where(tk => tk.VaiTro == "Admin" && tk.TrangThai == true)
                        .Select(tk => new
                        {
                            maTk = tk.MaTk,
                            tenDangNhap = tk.TenDangNhap,
                            hoTen = tk.NhanVien != null ? tk.NhanVien.HoTen : tk.TenDangNhap,
                            vaiTro = tk.VaiTro
                        })
                        .ToListAsync<object>();
                }
                else if (role.ToLower() == "nhanvien")
                {
                    accounts = await _context.TaiKhoans
                        .Include(tk => tk.NhanVien)
                        .Where(tk => tk.VaiTro == "NhanVien" && tk.TrangThai == true)
                        .Select(tk => new
                        {
                            maTk = tk.MaTk,
                            tenDangNhap = tk.TenDangNhap,
                            hoTen = tk.NhanVien != null ? tk.NhanVien.HoTen : tk.TenDangNhap,
                            vaiTro = tk.VaiTro
                        })
                        .ToListAsync<object>();
                }
                else if (role.ToLower() == "docgia")
                {
                    accounts = await _context.TaiKhoans
                        .Include(tk => tk.DocGium)
                        .Where(tk => tk.VaiTro == "DocGia" && tk.TrangThai == true)
                        .Select(tk => new
                        {
                            maTk = tk.MaTk,
                            tenDangNhap = tk.TenDangNhap,
                            hoTen = tk.DocGium != null ? tk.DocGium.HoTen : tk.TenDangNhap,
                            vaiTro = tk.VaiTro
                        })
                        .ToListAsync<object>();
                }
                else
                {
                    return BadRequest(new { message = "Vai trò không hợp lệ. Vui lòng chọn: Admin, NhanVien, hoặc DocGia" });
                }

                _logger.LogInformation($"Lấy được {accounts.Count} tài khoản với vai trò {role}");
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting accounts by role: {Role}", role);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách tài khoản", error = ex.Message });
            }
        }
    }

    public class CreateNoticeDto
    {
        public string NoiDung { get; set; } = string.Empty;
        public int? MaTk { get; set; }
    }
}






