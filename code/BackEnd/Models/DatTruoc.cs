using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace BackEnd.Models;

public partial class DatTruoc
{
    public int MaDat { get; set; }

    public int? MaDg { get; set; }

    public int? MaSach { get; set; }

    public DateOnly? NgayDat { get; set; }

    public string? TrangThai { get; set; }
    public int SoLuong { get; set; }

    [JsonIgnore]
    public virtual DocGium? MaDgNavigation { get; set; }
    [JsonIgnore]
    public virtual Sach? MaSachNavigation { get; set; }
}
