using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class BaoCao
{
    public int MaBc { get; set; }

    public string? LoaiBc { get; set; }

    public string? LinkFile { get; set; }

    public DateTime? NgayLap { get; set; }

    public int? MaNv { get; set; }

    public virtual NhanVien? MaNvNavigation { get; set; }
}
