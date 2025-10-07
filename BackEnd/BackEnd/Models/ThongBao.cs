using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class ThongBao
{
    public int MaTb { get; set; }

    public string? NoiDung { get; set; }

    public DateOnly? NgayTb { get; set; }

    public int? MaTk { get; set; }

    public virtual TaiKhoan? MaTkNavigation { get; set; }
}
