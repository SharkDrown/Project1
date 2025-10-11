using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class LichSuDangNhap
{
    public int MaLs { get; set; }

    public int? MaTk { get; set; }

    public DateTime? ThoiGian { get; set; }

    public string? DiaChiIp { get; set; }

    public virtual TaiKhoan? MaTkNavigation { get; set; }
}
