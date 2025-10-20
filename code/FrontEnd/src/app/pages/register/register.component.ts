import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';   // 👈 thêm import
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  model: any = {
    TenDangNhap: '',
    MatKhau: '',
    HoTen: '',
    NgaySinh: '',
    DiaChi: '',
    Email: '',
    SoDT: '',
    TermsAccepted: false
  };

  confirmPassword: string = '';
  message: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {} // 👈 inject Router

  onSubmit() {
    if (this.model.MatKhau !== this.confirmPassword) {
      this.message = '⚠️ Mật khẩu xác nhận không khớp.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.authService.register(this.model).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = res.message || 'Đăng ký thành công!';
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.message = err.error?.message || 'Đăng ký thất bại, vui lòng thử lại.';
      }
    });
  }
}
