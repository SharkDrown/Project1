using BackEnd.Models;
using Microsoft.EntityFrameworkCore;
using BackEnd.Services.Interfaces;
using System.Threading.Tasks;
namespace BackEnd.Services
{
    public class PhieuPhatService: IPhieuPhatService
    {
        private readonly QuanLyThuVienContext _context;

        public PhieuPhatService(QuanLyThuVienContext context)
        {
            _context = context;
        }

        public async Task<bool> UpdateStatusToDaDongAsync(int maPp)
        {
            // 1. Tìm Phiếu phạt theo mã (MaPp)
            var phieuPhat = await _context.PhieuPhats
                                        .FirstOrDefaultAsync(pp => pp.MaPp == maPp);

            if (phieuPhat == null)
            {
                return false; // Không tìm thấy Phiếu phạt
            }

            // 2. Cập nhật trạng thái nếu chưa được đóng
            if (phieuPhat.TrangThai != "DaDong")
            {
                phieuPhat.TrangThai = "DaDong"; // ⭐️ Gán trạng thái là "DaDong" ⭐️
                _context.PhieuPhats.Update(phieuPhat);
                await _context.SaveChangesAsync();
            }

            return true;
        }
    }
}
