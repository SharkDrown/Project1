using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BackEnd.Models;
<<<<<<< HEAD
=======
using Microsoft.EntityFrameworkCore;
>>>>>>> e9f5ac1fd4e0dbd1be90a8a2f9378a93918bf52c
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

public class JwtService
{
    private readonly IConfiguration _config;
<<<<<<< HEAD

    public JwtService(IConfiguration config)
    {
        _config = config;
=======
    private readonly QuanLyThuVienContext _context; 
    public JwtService(IConfiguration config, QuanLyThuVienContext context)
    {
        _config = config;
        _context = context;
>>>>>>> e9f5ac1fd4e0dbd1be90a8a2f9378a93918bf52c
    }

    public string GenerateToken(TaiKhoan user)
    {
        var jwtSection = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
<<<<<<< HEAD

        var expiresMinutes = int.TryParse(jwtSection["ExpiresMinutes"], out var m) ? m : 120;
=======
        
        var expiresMinutes = int.TryParse(jwtSection["ExpiresMinutes"], out var m) ? m : 120;
        var docGia = _context.DocGia.FirstOrDefault(d => d.MaTk == user.MaTk);
        var hoTen = docGia?.HoTen ?? user.TenDangNhap;
>>>>>>> e9f5ac1fd4e0dbd1be90a8a2f9378a93918bf52c

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.MaTk.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.TenDangNhap ?? string.Empty),
<<<<<<< HEAD
            new Claim(ClaimTypes.NameIdentifier, user.MaTk.ToString()),
            new Claim(ClaimTypes.Role, user.VaiTro ?? "DocGia")
=======
            new Claim("HoTen", hoTen),
            new Claim(ClaimTypes.NameIdentifier, user.MaTk.ToString()),
            new Claim(ClaimTypes.Name, user.TenDangNhap ?? string.Empty),
            new Claim(ClaimTypes.Role, string.IsNullOrEmpty(user.VaiTro) ? "DocGia" : user.VaiTro),
            new Claim("role", string.IsNullOrEmpty(user.VaiTro) ? "DocGia" : user.VaiTro)
>>>>>>> e9f5ac1fd4e0dbd1be90a8a2f9378a93918bf52c
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
