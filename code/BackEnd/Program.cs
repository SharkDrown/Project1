using BackEnd.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "API", Version = "v1" });

    // 🟢 Thêm phần cấu hình xác thực Bearer
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Nhập token theo dạng: Bearer {token}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


// Đăng ký DbContext với chuỗi kết nối
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' không được tìm thấy trong appsettings.json");
}

builder.Services.AddDbContext<QuanLyThuVienContext>(options =>
    options.UseSqlServer(connectionString)
           .EnableSensitiveDataLogging() // Cho phép log SQL queries (chỉ dùng trong development)
           .LogTo(Console.WriteLine, LogLevel.Information)); // Log SQL queries ra console
// Thêm CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200", "http://127.0.0.1:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ===== Cấu hình JWT =====
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"];
var jwtIssuer = jwtSection["Issuer"];
var jwtAudience = jwtSection["Audience"];

// Kiểm tra JWT configuration
if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT Key không được để trống trong appsettings.json");
}
if (string.IsNullOrEmpty(jwtIssuer))
{
    throw new InvalidOperationException("JWT Issuer không được để trống trong appsettings.json");
}
if (string.IsNullOrEmpty(jwtAudience))
{
    throw new InvalidOperationException("JWT Audience không được để trống trong appsettings.json");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
options.RequireHttpsMetadata = false; // Cho dev, khi deploy nhớ bật true
options.SaveToken = true;
options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    ValidIssuer = jwtIssuer,
    ValidAudience = jwtAudience,
    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
};
options.Events = new JwtBearerEvents
{
    OnTokenValidated = async context =>
    {
        var db = context.HttpContext.RequestServices.GetRequiredService<QuanLyThuVienContext>();
        var claims = context.Principal?.Identity as ClaimsIdentity;

        var userIdClaim = claims?.FindFirst(ClaimTypes.NameIdentifier)
                       ?? claims?.FindFirst(JwtRegisteredClaimNames.Sub);

        if (userIdClaim == null)
        {
            context.Fail("Không tìm thấy userId trong token");
            return;
        }

        var userId = int.Parse(userIdClaim.Value);
        var user = await db.TaiKhoans.FindAsync(userId);

        if (user == null || user.TrangThai == false)
        {
            context.Fail("Tài khoản đã bị vô hiệu hóa");
        }
    }
    };
});

// Đăng ký JwtService để sinh token
builder.Services.AddScoped<JwtService>();


var app = builder.Build();

// ✅ Kiểm tra kết nối database khi khởi động
try
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<QuanLyThuVienContext>();
        // Test kết nối database
        var canConnect = context.Database.CanConnect();
        if (canConnect)
        {
            Console.WriteLine("✅ Kết nối database thành công!");
            // Kiểm tra xem có dữ liệu sách không
            var bookCount = context.Saches.Count();
            Console.WriteLine($"📚 Số lượng sách trong database: {bookCount}");
        }
        else
        {
            Console.WriteLine("⚠️ Cảnh báo: Không thể kết nối tới database!");
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Lỗi kết nối database: {ex.Message}");
    Console.WriteLine($"Chi tiết: {ex.InnerException?.Message ?? ex.ToString()}");
    Console.WriteLine("⚠️ Backend vẫn sẽ chạy nhưng có thể không truy cập được database!");
}

// Configure the HTTP request pipeline.
// ✅ QUAN TRỌNG: UseCors phải được đặt TRƯỚC UseAuthentication và UseAuthorization
app.UseCors("AllowAngular");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
