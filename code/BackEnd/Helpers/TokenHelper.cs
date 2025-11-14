using System;

namespace BackEnd.Helpers
{
    public static class TokenHelper
    {
        public static string GenerateRefreshToken()
        {
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        }
    }
}
