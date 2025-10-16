using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class Sach
{
    public int MaSach { get; set; }

    public string TuaSach { get; set; } = null!;

    public int? NamXb { get; set; }

    public string? NhaXb { get; set; }

    public int? SoLuong { get; set; }

    public string? MaTl { get; set; }

    public string? GioiThieu { get; set; }

    public virtual ICollection<CuonSach> CuonSaches { get; set; } = new List<CuonSach>();

    public virtual ICollection<DanhGiaSach> DanhGiaSaches { get; set; } = new List<DanhGiaSach>();

    public virtual ICollection<DatTruoc> DatTruocs { get; set; } = new List<DatTruoc>();

    public virtual TheLoai? MaTlNavigation { get; set; }

    public virtual ICollection<TacGium> TacGia { get; set; } = new List<TacGium>();

    
}
