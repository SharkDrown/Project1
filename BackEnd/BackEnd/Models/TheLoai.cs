using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class TheLoai
{
    public string MaTl { get; set; } = null!;

    public string TenTl { get; set; } = null!;

    public virtual ICollection<Sach> Saches { get; set; } = new List<Sach>();
}
