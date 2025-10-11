using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class PhieuMuon
{
    public int MaPm { get; set; }

    public int? MaDg { get; set; }

    public int? MaNv { get; set; }

    public DateOnly? NgayMuon { get; set; }

    public DateOnly? NgayTra { get; set; }

    public virtual ICollection<ChiTietPhieuMuon> ChiTietPhieuMuons { get; set; } = new List<ChiTietPhieuMuon>();

    public virtual DocGium? MaDgNavigation { get; set; }

    public virtual NhanVien? MaNvNavigation { get; set; }

    public virtual ICollection<PhieuPhat> PhieuPhats { get; set; } = new List<PhieuPhat>();
}
