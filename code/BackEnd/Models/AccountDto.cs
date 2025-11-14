namespace BackEnd.Models
{
<<<<<<< HEAD
=======
    // DTO dùng để trả về thông tin tài khoản
>>>>>>> e9f5ac1fd4e0dbd1be90a8a2f9378a93918bf52c
    public class AccountDto
    {
        public int MaTK { get; set; }
        public string TenDangNhap { get; set; } = string.Empty;
        public string VaiTro { get; set; } = string.Empty;
        public bool TrangThai { get; set; }
<<<<<<< HEAD
    }

    public class UpdateAccountDto
{
    // Thay đổi mật khẩu
    public string? MatKhauCu { get; set; }
    public string? MatKhauMoi { get; set; }
    public string? TenDangNhap { get; set; } 

    // Thông tin độc giả
    public string? HoTen { get; set; }
    public DateOnly? NgaySinh { get; set; }
    public string? DiaChi { get; set; }
    public string? Email { get; set; }
    public string? SoDT { get; set; }
}
=======

        
        public string? HoTen { get; set; }
        public DateOnly? NgaySinh { get; set; }   
        public string? DiaChi { get; set; }       
        public string? Email { get; set; }
        public string? SoDT { get; set; }
        public string? ChucVu { get; set; }       
    }

    // DTO dùng khi cập nhật thông tin
    public class UpdateAccountDto
    {
        
        public string? MatKhauCu { get; set; }
        public string? MatKhauMoi { get; set; }

        
        public string? TenDangNhap { get; set; }

        
        public string? HoTen { get; set; }
        public DateOnly? NgaySinh { get; set; }
        public string? DiaChi { get; set; }
        public string? Email { get; set; }
        public string? SoDT { get; set; }
        public string? ChucVu { get; set; }   
    }
>>>>>>> e9f5ac1fd4e0dbd1be90a8a2f9378a93918bf52c
}
