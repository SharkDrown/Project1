using System;
using System.Collections.Generic;

namespace BackEnd.Models;

public partial class RefreshToken
{
    public int MaToken { get; set; }

    public int MaTk { get; set; }

    public string Token { get; set; } = null!;

    public DateTime ExpiryDate { get; set; }

    public bool? IsRevoked { get; set; }

    public virtual TaiKhoan MaTkNavigation { get; set; } = null!;
}
