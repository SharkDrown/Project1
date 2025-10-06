import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true, // quan trọng: standalone component
  imports: [FormsModule, CommonModule, RouterModule] // để dùng ngModel, ngIf, ngForm
})
export class RegisterComponent {
  model: any = {
    TenDangNhap: '',
    MatKhau: '',
    VaiTro: ''
  };
  confirmPassword: string = '';
  message: string = '';
  loading: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (this.model.MatKhau !== this.confirmPassword) {
      this.message = '❌ Mật khẩu xác nhận không khớp!';
      return;
    }

    this.loading = true;
    this.auth.register(this.model).subscribe({
      next: (res) => {
        this.message = res?.message ?? '✅ Đăng ký thành công!';
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.message = err?.error?.message || '❌ Đăng ký thất bại!';
        this.loading = false;
      }
    });
  }
}
