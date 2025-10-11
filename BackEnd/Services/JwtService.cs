using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BackEnd.Models;
using BackEnd.DTOs;

namespace BackEnd.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(TaiKhoan taiKhoan)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, taiKhoan.MaTk.ToString()),
                new Claim(ClaimTypes.Name, taiKhoan.TenDangNhap),
                new Claim(ClaimTypes.Role, taiKhoan.VaiTro),
                new Claim("MaTK", taiKhoan.MaTk.ToString()),
                new Claim("TenDangNhap", taiKhoan.TenDangNhap),
                new Claim("VaiTro", taiKhoan.VaiTro)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(Convert.ToDouble(_configuration["Jwt:ExpireHours"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString();
        }

        public bool ValidateToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public UserInfo GetUserInfoFromToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            return new UserInfo
            {
                MaTK = int.Parse(jwtToken.Claims.First(x => x.Type == "MaTK").Value),
                TenDangNhap = jwtToken.Claims.First(x => x.Type == "TenDangNhap").Value,
                VaiTro = jwtToken.Claims.First(x => x.Type == "VaiTro").Value
            };
        }
    }
}
