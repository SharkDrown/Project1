using Microsoft.AspNetCore.Mvc;
using BackEnd.DTOs;
using BackEnd.Services;
using System.Security.Claims;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var ipAddress = GetClientIpAddress();
                var result = await _authService.LoginAsync(request, ipAddress);

                if (result == null)
                {
                    return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for user: {Username}", request.TenDangNhap);
                return StatusCode(500, new { message = "Có lỗi xảy ra trong quá trình đăng nhập" });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var ipAddress = GetClientIpAddress();
                var result = await _authService.RegisterAsync(request, ipAddress);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for user: {Username}", request.TenDangNhap);
                return StatusCode(500, new { message = "Có lỗi xảy ra trong quá trình đăng ký" });
            }
        }

        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {
            try
            {
                var maTK = GetCurrentUserId();
                if (maTK.HasValue)
                {
                    await _authService.LogoutAsync(maTK.Value);
                }

                return Ok(new { message = "Đăng xuất thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, new { message = "Có lỗi xảy ra trong quá trình đăng xuất" });
            }
        }

        [HttpGet("check-username/{username}")]
        public async Task<ActionResult<bool>> CheckUsername(string username)
        {
            try
            {
                var exists = await _authService.IsUsernameExistsAsync(username);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking username: {Username}", username);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi kiểm tra tên đăng nhập" });
            }
        }

        [HttpGet("check-email/{email}")]
        public async Task<ActionResult<bool>> CheckEmail(string email)
        {
            try
            {
                var exists = await _authService.IsEmailExistsAsync(email);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking email: {Email}", email);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi kiểm tra email" });
            }
        }

        [HttpGet("profile")]
        public async Task<ActionResult> GetProfile()
        {
            try
            {
                var maTK = GetCurrentUserId();
                if (!maTK.HasValue)
                {
                    return Unauthorized(new { message = "Chưa đăng nhập" });
                }

                // You can implement a method to get user profile here
                return Ok(new { message = "Profile endpoint - to be implemented" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting profile");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy thông tin profile" });
            }
        }


        private string? GetClientIpAddress()
        {
            var xForwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(xForwardedFor))
            {
                return xForwardedFor.Split(',')[0].Trim();
            }

            return Request.HttpContext.Connection.RemoteIpAddress?.ToString();
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("MaTK");
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return null;
        }
    }
}
