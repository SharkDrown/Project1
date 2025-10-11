using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class DocGium
{
    public int MaDg { get; set; }

    public string HoTen { get; set; } = null!;

    public DateOnly? NgaySinh { get; set; }

    public string? DiaChi { get; set; }

    public string? Email { get; set; }

    public string? SoDt { get; set; }

    public int? MaTk { get; set; }

    public virtual ICollection<DanhGiaSach> DanhGiaSaches { get; set; } = new List<DanhGiaSach>();

    public virtual ICollection<DatTruoc> DatTruocs { get; set; } = new List<DatTruoc>();

    public virtual TaiKhoan? MaTkNavigation { get; set; }

    public virtual ICollection<PhieuMuon> PhieuMuons { get; set; } = new List<PhieuMuon>();
}
