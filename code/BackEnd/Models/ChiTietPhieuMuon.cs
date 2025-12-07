using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BackEnd.Models;

public partial class ChiTietPhieuMuon
{
    public int MaPm { get; set; }

    public string MaVach { get; set; } = null!;

    public DateOnly? NgayTraThucTe { get; set; }
    [JsonIgnore]
    [ForeignKey(nameof(MaPm))]
    public virtual PhieuMuon? MaPmNavigation { get; set; } = null!;
    [JsonIgnore]
    [ForeignKey(nameof(MaVach))]
    public virtual CuonSach? MaVachNavigation { get; set; } = null!;
}
