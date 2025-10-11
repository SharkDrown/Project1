using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class DatTruoc
{
    public int MaDat { get; set; }

    public int MaDg { get; set; }

    public int MaSach { get; set; }

    public DateOnly? NgayDat { get; set; }

    public string? TrangThai { get; set; }

    public virtual DocGium MaDgNavigation { get; set; } = null!;

    public virtual Sach MaSachNavigation { get; set; } = null!;
}
