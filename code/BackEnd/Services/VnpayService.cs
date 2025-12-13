using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using System.Net;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;

namespace BackEnd.Services
{
    public class VnpayService
    {
        private readonly string _tmnCode;
        private readonly string _hashSecret;
        private readonly string _baseUrl;
        private readonly string _returnUrl;
        private readonly ILogger<VnpayService> _logger;

        public VnpayService(IConfiguration configuration, ILogger<VnpayService> logger)
        {
            _tmnCode = configuration["VnpaySettings:TmnCode"]
                ?? throw new ArgumentNullException("Vnpay TmnCode not configured.");

            _hashSecret = configuration["VnpaySettings:HashSecret"]?.Trim()
                ?? throw new ArgumentNullException("Vnpay HashSecret not configured.");

            _baseUrl = configuration["VnpaySettings:BaseUrl"]
                ?? throw new ArgumentNullException("Vnpay BaseUrl not configured.");

            _returnUrl = configuration["VnpaySettings:ReturnUrl"]
                ?? throw new ArgumentNullException("Vnpay ReturnUrl not configured.");

            _logger = logger;
        }

        // ========================= CREATE PAYMENT URL =========================
        public string CreatePaymentUrl(int maPp, decimal amount, string ipAddress)
        {
            if (string.IsNullOrWhiteSpace(ipAddress) || ipAddress == "127.0.0.1" || ipAddress == "::1")
            {
                ipAddress = "171.224.181.225"; 
            }
            var vnp_Params = new SortedList<string, string>(StringComparer.Ordinal)
            {
                { "vnp_Version", "2.1.0" },
                { "vnp_Command", "pay" },
                { "vnp_TmnCode", _tmnCode },
                { "vnp_Amount", ((long)(amount * 100)).ToString() },
                { "vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss") },
                { "vnp_CurrCode", "VND" },
                { "vnp_IpAddr", ipAddress },
                { "vnp_Locale", "vn" },
                { "vnp_OrderInfo", $"ThanhToanPhatMaPP{maPp}" },
                { "vnp_OrderType", "other" },
                { "vnp_ReturnUrl", _returnUrl },
                { "vnp_TxnRef", maPp.ToString() }
            };

            // ================= RAW DATA (KHÔNG ENCODE) =================
            string rawData = string.Join("&",
                vnp_Params.Select(x =>
                    $"{x.Key}={WebUtility.UrlEncode(x.Value)}"
                )
            );

            _logger.LogInformation("===== VNPAY CREATE PAYMENT =====");
            _logger.LogInformation("RawData(Create): {RawData}", rawData);

            string secureHash = HmacSHA512(_hashSecret, rawData);

            _logger.LogInformation("SecureHash(Create): {Hash}", secureHash);
            _logger.LogInformation("================================");
            _logger.LogInformation("VNPAY IP USED: {Ip}", ipAddress);


            // ================= BUILD URL (CÓ ENCODE) =================
            string query = rawData
                            + "&vnp_SecureHashType=HmacSHA512"
                            + "&vnp_SecureHash=" + secureHash;

            string paymentUrl = $"{_baseUrl}?{query}";

            _logger.LogInformation("VNPAY REDIRECT URL: {Url}", paymentUrl);

            return paymentUrl;
        }

        // ========================= VERIFY SIGNATURE =========================
        public bool ValidateSignature(IQueryCollection query)
        {
            try
            {
                string receivedHash = query["vnp_SecureHash"].FirstOrDefault() ?? string.Empty;

                if (string.IsNullOrEmpty(receivedHash))
                {
                    _logger.LogWarning("[VNPAY] Missing vnp_SecureHash");
                    return false;
                }

                var vnpData = new SortedList<string, string>(StringComparer.Ordinal);

                foreach (var kv in query)
                {
                    if (!kv.Key.StartsWith("vnp_")) continue;
                    if (kv.Key.Equals("vnp_SecureHash", StringComparison.OrdinalIgnoreCase)) continue;
                    if (kv.Key.Equals("vnp_SecureHashType", StringComparison.OrdinalIgnoreCase)) continue;

                    var value = kv.Value.FirstOrDefault();
                    if (!string.IsNullOrEmpty(value))
                        vnpData.Add(kv.Key, value);
                }

                var rawDataBuilder = new StringBuilder();
                foreach (var entry in vnpData)
                {
                    rawDataBuilder.Append(entry.Key)
                                  .Append("=")
                                  .Append(entry.Value)
                                  .Append("&");
                }

                string rawData = rawDataBuilder.ToString().TrimEnd('&');
                string computedHash = HmacSHA512(_hashSecret, rawData);

                // 🔹 LOG VERIFY
                _logger.LogInformation("===== VNPAY VERIFY SIGNATURE =====");
                _logger.LogInformation("QueryString: {Query}", query.ToString());
                _logger.LogInformation("RawData(Verify): {RawData}", rawData);
                _logger.LogInformation("ComputedHash: {Hash}", computedHash);
                _logger.LogInformation("ReceivedHash: {Hash}", receivedHash);
                _logger.LogInformation("VerifyResult: {Result}",
                    string.Equals(computedHash, receivedHash, StringComparison.OrdinalIgnoreCase));
                _logger.LogInformation("=================================");

                return string.Equals(computedHash, receivedHash, StringComparison.OrdinalIgnoreCase);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[VNPAY] ValidateSignature Exception");
                return false;
            }
        }

        // ========================= HASH =========================
        private string HmacSHA512(string key, string data)
        {
            using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
        }
    }
}
