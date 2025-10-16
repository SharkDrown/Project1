using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class CuonSach
{
    public string MaVach { get; set; } = null!;

    public int? MaSach { get; set; }

    public string? TinhTrang { get; set; }

    public virtual ICollection<ChiTietPhieuMuon> ChiTietPhieuMuons { get; set; } = new List<ChiTietPhieuMuon>();

    public virtual Sach? MaSachNavigation { get; set; }
}
