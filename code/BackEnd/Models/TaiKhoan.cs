using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class TaiKhoan
{
    public int MaTk { get; set; }

    public string TenDangNhap { get; set; } = null!;

    public string MatKhau { get; set; } = null!;

    public string? VaiTro { get; set; }

    public bool? TrangThai { get; set; }

    public DateTime? LastActive { get; set; }

    public virtual DocGium? DocGium { get; set; }

    public virtual ICollection<LichSuCapNhatTaiKhoan> LichSuCapNhatTaiKhoans { get; set; } = new List<LichSuCapNhatTaiKhoan>();

    public virtual ICollection<LichSuDangNhap> LichSuDangNhaps { get; set; } = new List<LichSuDangNhap>();

    public virtual NhanVien? NhanVien { get; set; }

    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public virtual ICollection<ThongBao> ThongBaos { get; set; } = new List<ThongBao>();
}
