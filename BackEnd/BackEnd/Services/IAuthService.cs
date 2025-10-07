using BackEnd.DTOs;

namespace BackEnd.Services
{
    public interface IAuthService
    {
        Task<AuthResponse?> LoginAsync(LoginRequest request, string? ipAddress);
        Task<AuthResponse?> RegisterAsync(RegisterRequest request, string? ipAddress);
        Task<bool> LogoutAsync(int maTK);
        Task<bool> IsUsernameExistsAsync(string tenDangNhap);
        Task<bool> IsEmailExistsAsync(string email);
    }
}


