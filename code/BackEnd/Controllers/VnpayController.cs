using BackEnd.Models;
using BackEnd.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq; 
using Microsoft.EntityFrameworkCore; 

namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VnpayController : ControllerBase
    {
        private readonly QuanLyThuVienContext _context;
        // ... (Có thể thêm Logger, VnpayService nếu cần kiểm tra Secure Hash trong hàm IPN) ...
      
        public VnpayController(QuanLyThuVienContext context)
        {
            _context = context;
           
        }

        // ⭐️ ENDPOINT XỬ LÝ KẾT QUẢ TRẢ VỀ (Return URL)
        // Sau khi VNPAY gọi endpoint này, ta sẽ redirect về Angular
        [HttpGet("payment-return")]
        public async Task<IActionResult> PaymentReturn([FromServices] VnpayService vnpayService)
        {
            var query = HttpContext.Request.Query;
            const string FE_BASE_URL = "http://localhost:4200";
            bool isValid = vnpayService.ValidateSignature(query);
            if (!isValid)
            {
                return Redirect(
                   $"{FE_BASE_URL}/payment-return" +
                   "?status=failed&reason=invalid_signature"
                );
            }

            string vnp_ResponseCode = query["vnp_ResponseCode"].FirstOrDefault();
            string maPp = query["vnp_TxnRef"].FirstOrDefault();

            if (vnp_ResponseCode == "00" && int.TryParse(maPp, out int maPpInt))
            {
                var fineTicket = await _context.PhieuPhats.FirstOrDefaultAsync(pp => pp.MaPp == maPpInt);
                if (fineTicket != null && fineTicket.TrangThai != "DaDong")
                {
                    fineTicket.TrangThai = "DaDong";
                    // -----------------------------------------------------------
                    // ⭐️ BỔ SUNG LOGIC NGHIỆP VỤ SAU KHI ĐÓNG PHẠT THÀNH CÔNG ⭐️
                    // -----------------------------------------------------------

                    // 2. Load Phiếu Mượn và các mối quan hệ liên quan (MaPM -> ChiTiet -> CuonSach)
                    var phieuMuon = await _context.PhieuMuons
                        .Where(pm => pm.MaPm == fineTicket.MaPm) // Lấy MaPM từ fineTicket
                        .Include(pm => pm.ChiTietPhieuMuons)
                            .ThenInclude(ctpm => ctpm.MaVachNavigation) // -> CuonSach
                        .FirstOrDefaultAsync();

                    if (phieuMuon != null)
                    {
                        // 3. Cập nhật Trạng thái Sách (CuonSach.TinhTrang)
                        foreach (var chiTiet in phieuMuon.ChiTietPhieuMuons)
                        {
                            var cuonSach = chiTiet.MaVachNavigation;

                            if (cuonSach != null)
                            {
                                // Yêu cầu: Trạng thái sách luôn là "Tot"
                                cuonSach.TinhTrang = "Tot";
                            }
                        }

                        // 4. Reset thông tin trên PhieuMuon về trạng thái null/---
                        // (Theo yêu cầu: Mã phiếu mượn, Ngày mượn, ngày trả dk, Mã độc giả trở về trạng thái ---)
                        phieuMuon.MaDg = null;         // Mã độc giả
                        phieuMuon.NgayMuon = null;     // Ngày mượn
                        phieuMuon.NgayTra = null;      // Ngày trả (NgayTra trong SQL Schema của bạn)
                                                       // MaNV và MaPM (Khóa chính) giữ nguyên.
                    }
                    await _context.SaveChangesAsync();
                }
            }

            string redirectUrl =
                $"{FE_BASE_URL}/payment-return" +
                $"?status={(vnp_ResponseCode == "00" ? "success" : "failed")}" +
                $"&maPp={maPp}" +
                $"&vnp_ResponseCode={vnp_ResponseCode}";
            return Redirect(redirectUrl);
        }
    }
}
