using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd.Models;
using BackEnd.Services;
namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FineController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context; // Thay thế bằng tên DbContext thực tế
        private readonly VnpayService _vnpayService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public FineController(QuanLyThuVienContext context, VnpayService vnpayService, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _vnpayService = vnpayService;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpPost("create")]
        // [Authorize(Roles = "Admin, Staff")] // Có thể thêm authorization nếu cần
        public async Task<IActionResult> CreateFineTicket([FromBody] FineTicketDto fineDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            bool fineExists = await _context.PhieuPhats
                                            .AnyAsync(pp => pp.MaPm == fineDto.MaPm);

            if (fineExists)
            {
                // Trả về 409 Conflict với thông báo yêu cầu
                return Conflict(new
                {
                    message = $"Đã tạo phiếu phạt cho phiếu mượn {fineDto.MaPm} này!",
                    maPm = fineDto.MaPm
                });
            }

            

            if (fineDto.SoTien <= 0 || string.IsNullOrWhiteSpace(fineDto.LyDo))
            {
                
                return BadRequest(new
                {
                    message = "Không có vi phạm phiếu mượn này!",
                    maPm = fineDto.MaPm
                });
            }
            // 1. Khởi tạo đối tượng PhieuPhat từ DTO
            var fineTicket = new PhieuPhat
            {
                MaPm = fineDto.MaPm,
                LyDo = fineDto.LyDo,
                SoTien = fineDto.SoTien,
                // NgayPhat và TrangThai sẽ tự động được gán giá trị mặc định từ DB
            };

            // 2. Thêm vào Context và lưu (Lệnh SQL INSERT)
            _context.PhieuPhats.Add(fineTicket); // Giả sử tên DbSet là PhieuPhats
            await _context.SaveChangesAsync();

            // TẠO THÔNG BÁO CHO ĐỘC GIẢ

            // Tìm MaTk của độc giả từ MaPM
           
            var maTk = await _context.PhieuMuons
                .Where(pm => pm.MaPm == fineDto.MaPm)
                // GIẢ ĐỊNH QUAN HỆ: PhieuMuon có thuộc tính DocGium, và DocGium có trường MaTk
                .Select(pm => pm.MaDgNavigation.MaTk)
                .FirstOrDefaultAsync();

            if (maTk.HasValue)
            {
                // 2.2. Tạo nội dung thông báo có cấu trúc đặc biệt (để FE phân tích)
                // Chuỗi phải khớp với regex ở Frontend: [PHAT] Mã PP: {MaPp} - {LyDo}. Số tiền: {SoTien}đ
                var noiDungTb = $"[PHAT] Mã PP: {fineTicket.MaPp} - {fineTicket.LyDo}. Số tiền: {fineTicket.SoTien}đ";

                var thongBao = new ThongBao
                {
                    NoiDung = noiDungTb,
                    MaTk = maTk.Value,
                    NgayTb = DateOnly.FromDateTime(DateTime.Now),
                };

                // 2.3. Thêm thông báo và lưu
                _context.ThongBaos.Add(thongBao);
                await _context.SaveChangesAsync();
            }
            // else: Nếu không tìm thấy MaTk, bỏ qua việc tạo thông báo, nhưng Phiếu Phạt vẫn được tạo.


            // 4. Trả về Mã Phiếu Phạt vừa tạo (MaPp)
            return Ok(new
            {
                message = "Tạo phiếu phạt thành công.",
                maPp = fineTicket.MaPp
            });
        }
        // ENDPOINT KHỞI TẠO THANH TOÁN
        [HttpPost("initiate-payment/{maPp}")]
        public async Task<IActionResult> InitiateFinePayment(int maPp)
        {
            var fineTicket = await _context.PhieuPhats
                .FirstOrDefaultAsync(pp => pp.MaPp == maPp && pp.TrangThai != "Paid");

            if (fineTicket == null)
            {
                return NotFound(new { message = "Phiếu phạt không hợp lệ hoặc đã thanh toán." });
            }

            // Lấy IP client
            var ipAddress = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            if (ipAddress == "::1") ipAddress = "127.0.0.1";

            // Tạo URL thanh toán qua VnpayService
            var paymentUrl = _vnpayService.CreatePaymentUrl(
                maPp,
                fineTicket.SoTien,
                ipAddress
            );

            return Ok(new { paymentUrl = paymentUrl });
        }
    }
}
