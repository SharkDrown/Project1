using BackEnd.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Đăng ký DbContext với chuỗi kết nối
builder.Services.AddDbContext<QuanLyThuVienContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
// Thêm CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
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
app.UseCors("AllowAngular");
app.UseStaticFiles();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
