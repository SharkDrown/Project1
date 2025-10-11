using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class PhieuPhat
{
    public int MaPp { get; set; }

    public int MaPm { get; set; }

    public string LyDo { get; set; } = null!;

    public decimal SoTien { get; set; }

    public DateOnly? NgayPhat { get; set; }

    public string? TrangThai { get; set; }

    public virtual PhieuMuon MaPmNavigation { get; set; } = null!;
}
