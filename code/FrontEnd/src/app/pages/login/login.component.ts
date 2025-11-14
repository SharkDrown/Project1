import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }

    this.http.post('/api/auth/login', {
      TenDangNhap: this.username,
      MatKhau: this.password
    }).subscribe({
      next: (res: any) => {
        console.log('✅ Login success:', res);

        // Lưu access_token và refresh_token
        if (res.access_token) {
          localStorage.setItem('access_token', res.access_token);
          if (res.refresh_token)
            localStorage.setItem('refresh_token', res.refresh_token);

          // Giải mã token để lấy thông tin người dùng
          const decodedToken: any = jwtDecode(res.access_token);
          console.log('Decoded token:', decodedToken);

          // Mã tài khoản (sub hoặc nameidentifier)
          const maTk = decodedToken?.sub 
            || decodedToken?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

          // Lấy tên hiển thị 
          const hoTen = decodedToken?.HoTen || decodedToken?.unique_name || this.username;

          // Lưu thông tin vào localStorage
          if (maTk) {
            localStorage.setItem('maTK', maTk);
            localStorage.setItem('maDg', maTk);
          }
          if (hoTen) {
            localStorage.setItem('hoTen', hoTen);
          }

          // Lưu role
          if (res.role) {
            localStorage.setItem('role', res.role);
          }

          // ✅ Kiểm tra role và điều hướng
          if (res.role && (res.role.toLowerCase() === 'admin' || res.role.toLowerCase() === 'nhanvien')) {
            this.router.navigate(['/admin'], { replaceUrl: true });
          } else {
            this.router.navigate(['/'], { replaceUrl: true });
          }
        }
      },
      error: (err) => {
        console.error('❌ Login failed', err);
        this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
      }
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('maTK');
    localStorage.removeItem('hoTen');
    localStorage.removeItem('maDg');
    localStorage.removeItem('role');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
