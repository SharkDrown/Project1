using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class DanhGiaSach
{
    public int MaDg { get; set; }

    public int MaSach { get; set; }

    public int? SoSao { get; set; }

    public string? BinhLuan { get; set; }

    public DateOnly? NgayDg { get; set; }

    public virtual DocGium MaDgNavigation { get; set; } = null!;

    public virtual Sach MaSachNavigation { get; set; } = null!;
}
