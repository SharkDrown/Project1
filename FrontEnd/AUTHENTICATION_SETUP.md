# Hướng dẫn Setup Hệ thống Authentication

## Tổng quan
Hệ thống authentication đã được implement với:
- **Backend**: .NET 8 Web API với JWT authentication
- **Frontend**: Angular 19 với reactive forms
- **Database**: SQL Server với Entity Framework Core

## Backend Setup

### 1. Cài đặt Packages
Các packages đã được thêm vào `BackEnd.csproj`:
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.0.3" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
```

### 2. Cấu hình Database
1. Cập nhật connection string trong `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=QuanLyThuVien;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

2. Chạy migration (nếu cần):
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 3. Cấu hình JWT
JWT settings trong `appsettings.json`:
```json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "LibraryManagementSystem",
    "Audience": "LibraryManagementSystem",
    "ExpireHours": 8
  }
}
```

### 4. API Endpoints
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/check-username/{username}` - Kiểm tra username
- `GET /api/auth/check-email/{email}` - Kiểm tra email
- `GET /api/auth/profile` - Lấy thông tin profile

## Frontend Setup

### 1. Cài đặt Dependencies
Các dependencies cần thiết đã có sẵn trong Angular 19:
- `@angular/forms` - Reactive forms
- `@angular/common/http` - HTTP client
- `@angular/router` - Routing

### 2. Services
- **AuthService** (`src/app/services/auth.service.ts`): Quản lý authentication
- **AuthInterceptor** (`src/app/interceptors/auth.interceptor.ts`): Tự động thêm token vào requests
- **AuthGuard** (`src/app/guards/auth.guard.ts`): Bảo vệ routes

### 3. Components
- **LoginComponent**: Form đăng nhập với validation
- **RegisterComponent**: Form đăng ký với validation
- **AccountMenuComponent**: Menu hiển thị thông tin user và logout

## Cách sử dụng

### 1. Chạy Backend
```bash
cd BackEnd/BackEnd
dotnet run
```
Backend sẽ chạy tại: `https://localhost:7000`

### 2. Chạy Frontend
```bash
cd FrontEnd
npm start
```
Frontend sẽ chạy tại: `http://localhost:4200`

### 3. Test Authentication
1. Truy cập `http://localhost:4200/login`
2. Đăng ký tài khoản mới hoặc đăng nhập
3. Kiểm tra menu account để xem thông tin user
4. Test logout functionality

## Database Schema

### Bảng TaiKhoan
- `MaTK` (INT, Primary Key)
- `TenDangNhap` (NVARCHAR(50), Unique)
- `MatKhau` (NVARCHAR(255)) - Được hash bằng BCrypt
- `VaiTro` (NVARCHAR(20)) - DocGia, NhanVien, Admin
- `TrangThai` (BIT) - Active/Inactive

### Bảng DocGia
- `MaDG` (INT, Primary Key)
- `HoTen` (NVARCHAR(100))
- `NgaySinh` (DATE)
- `DiaChi` (NVARCHAR(255))
- `Email` (NVARCHAR(100), Unique)
- `SoDT` (NVARCHAR(20))
- `MaTK` (INT, Foreign Key)

### Bảng NhanVien
- `MaNV` (INT, Primary Key)
- `HoTen` (NVARCHAR(100))
- `ChucVu` (NVARCHAR(50))
- `Email` (NVARCHAR(100), Unique)
- `SoDT` (NVARCHAR(20))
- `MaTK` (INT, Foreign Key)

### Bảng LichSuDangNhap
- `MaLS` (INT, Primary Key)
- `MaTK` (INT, Foreign Key)
- `ThoiGian` (DATETIME)
- `DiaChiIP` (NVARCHAR(50))

## Security Features

1. **Password Hashing**: Sử dụng BCrypt để hash mật khẩu
2. **JWT Tokens**: Secure token-based authentication
3. **CORS**: Cấu hình CORS cho Angular app
4. **Input Validation**: Validation ở cả frontend và backend
5. **Login History**: Tracking lịch sử đăng nhập
6. **Role-based Access**: Phân quyền theo vai trò

## Troubleshooting

### 1. CORS Issues
Đảm bảo CORS được cấu hình đúng trong `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### 2. Database Connection
Kiểm tra connection string và đảm bảo SQL Server đang chạy.

### 3. JWT Token Issues
Kiểm tra JWT settings và đảm bảo key đủ dài (ít nhất 32 ký tự).

### 4. Angular Build Issues
Đảm bảo tất cả imports đúng và không có lỗi TypeScript.

## Next Steps

1. **Implement Role-based Guards**: Tạo guards cho Admin và NhanVien
2. **Add Password Reset**: Implement chức năng reset mật khẩu
3. **Add Email Verification**: Xác thực email khi đăng ký
4. **Add Remember Me**: Implement remember me functionality
5. **Add Social Login**: Google/Facebook login
6. **Add Two-Factor Authentication**: 2FA cho tài khoản admin



