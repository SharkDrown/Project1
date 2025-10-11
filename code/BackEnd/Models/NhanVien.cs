using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class NhanVien
{
    public int MaNv { get; set; }

    public string HoTen { get; set; } = null!;

    public string? ChucVu { get; set; }

    public string? Email { get; set; }

    public string? SoDt { get; set; }

    public int? MaTk { get; set; }

    public virtual ICollection<BaoCao> BaoCaos { get; set; } = new List<BaoCao>();

    public virtual TaiKhoan? MaTkNavigation { get; set; }

    public virtual ICollection<PhieuMuon> PhieuMuons { get; set; } = new List<PhieuMuon>();
}
