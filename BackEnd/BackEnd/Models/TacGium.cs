using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class TacGium
{
    public string MaTg { get; set; } = null!;

    public string TenTg { get; set; } = null!;

    public virtual ICollection<Sach> MaSaches { get; set; } = new List<Sach>();
}
