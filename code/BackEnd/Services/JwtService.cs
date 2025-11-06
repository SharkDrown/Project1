using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BackEnd.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

public class JwtService
{
    private readonly IConfiguration _config;
    private readonly QuanLyThuVienContext _context; 
    public JwtService(IConfiguration config, QuanLyThuVienContext context)
    {
        _config = config;
        _context = context;
    }

    public string GenerateToken(TaiKhoan user)
    {
        var jwtSection = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var expiresMinutes = int.TryParse(jwtSection["ExpiresMinutes"], out var m) ? m : 120;
        var docGia = _context.DocGia.FirstOrDefault(d => d.MaTk == user.MaTk);
        var hoTen = docGia?.HoTen ?? user.TenDangNhap;

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.MaTk.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.TenDangNhap ?? string.Empty),
            new Claim("HoTen", hoTen),
            new Claim(ClaimTypes.NameIdentifier, user.MaTk.ToString()),
            new Claim(ClaimTypes.Role, user.VaiTro ?? "DocGia")
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
