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
        var jwtKey = jwtSection["Key"];
        
        if (string.IsNullOrEmpty(jwtKey))
        {
            throw new InvalidOperationException("JWT Key không được để trống trong appsettings.json");
        }
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var expiresMinutes = int.TryParse(jwtSection["ExpiresMinutes"], out var m) ? m : 120;
        
        // Lấy HoTen từ DocGia hoặc NhanVien tùy theo vai trò
        string? hoTen = null;
        if (user.VaiTro == "DocGia")
        {
            var docGia = _context.DocGia.FirstOrDefault(d => d.MaTk == user.MaTk);
            hoTen = docGia?.HoTen;
        }
        else if (user.VaiTro == "Admin" || user.VaiTro == "NhanVien")
        {
            var nhanVien = _context.NhanViens.FirstOrDefault(n => n.MaTk == user.MaTk);
            hoTen = nhanVien?.HoTen;
        }
        
        hoTen = hoTen ?? user.TenDangNhap ?? string.Empty;

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.MaTk.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.TenDangNhap ?? string.Empty),
            new Claim("HoTen", hoTen),
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
