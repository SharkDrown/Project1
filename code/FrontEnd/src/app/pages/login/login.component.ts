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
        console.log(' Login success:', res);

        // Lưu access_token và refresh_token
        if (res.access_token) {
          localStorage.setItem('access_token', res.access_token);
           //  Giải mã token để lấy MaTk, VaiTro
          const decodedToken: any = jwtDecode(res.access_token);
          console.log('Decoded token:', decodedToken);

          const maTK = decodedToken?.sub || decodedToken?.MaTk;
          if (maTK) {
            localStorage.setItem('maTK', maTK);
          }
        }
       
       
        if (res.refresh_token) {
          localStorage.setItem('refresh_token', res.refresh_token);
        }
        
        // ✅ Chuyển hướng sang trang chủ (hoặc trang lịch sử, đặt trước...)
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
      }
    });
  }
}
