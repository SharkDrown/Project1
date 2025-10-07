using BackEnd.Models;
using BackEnd.DTOs;

namespace BackEnd.Services
{
    public interface IJwtService
    {
        string GenerateToken(TaiKhoan taiKhoan);
        string GenerateRefreshToken();
        bool ValidateToken(string token);
        UserInfo GetUserInfoFromToken(string token);
    }
}


