using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class ChiTietPhieuMuon
{
    public int MaPm { get; set; }

    public string MaVach { get; set; } = null!;

    public DateOnly? NgayTraThucTe { get; set; }

    public virtual PhieuMuon MaPmNavigation { get; set; } = null!;

    public virtual CuonSach MaVachNavigation { get; set; } = null!;
}
