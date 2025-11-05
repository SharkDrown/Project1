using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BackEnd.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

public class JwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(TaiKhoan user)
    {
        var jwtSection = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiresMinutes = int.TryParse(jwtSection["ExpiresMinutes"], out var m) ? m : 120;

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.MaTk.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.TenDangNhap ?? string.Empty),
            new Claim(ClaimTypes.NameIdentifier, user.MaTk.ToString()),
            new Claim(ClaimTypes.Name, user.TenDangNhap ?? string.Empty),
            new Claim(ClaimTypes.Role, string.IsNullOrEmpty(user.VaiTro) ? "DocGia" : user.VaiTro),
            new Claim("role", string.IsNullOrEmpty(user.VaiTro) ? "DocGia" : user.VaiTro)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
