import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  account: any = {
    tenDangNhap: '',
    hoTen: '',
    ngaySinh: '',
    diaChi: '',
    email: '',
    soDT: ''
  };

  oldPassword: string = '';
  newPassword: string = '';
  message: string = '';
  isSuccess: boolean = true;
  showToast: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAccount();
  }

  /** 🔹 Hiển thị toast (auto ẩn sau 3 giây) */
  showMessage(msg: string, success: boolean = true) {
  this.showToast = false;  
  setTimeout(() => {       
    this.message = msg;
    this.isSuccess = success;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }, 50);
}

  loadAccount() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    this.http.get('/api/account/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.account = res;
      },
      error: err => {
        console.error('❌ Lỗi tải thông tin tài khoản:', err);
        this.showMessage('Không thể tải thông tin tài khoản', false);
      }
    });
  }

  onUpdate() {
    if ((this.oldPassword && !this.newPassword) || (!this.oldPassword && this.newPassword)) {
      this.showMessage('⚠️ Vui lòng nhập cả mật khẩu cũ và mật khẩu mới.', false);
      return;
    }

    const body: any = {
      tenDangNhap: this.account.tenDangNhap,
      hoTen: this.account.hoTen,
      ngaySinh: this.account.ngaySinh,
      diaChi: this.account.diaChi,
      email: this.account.email,
      soDT: this.account.soDT
    };

    if (this.oldPassword && this.newPassword) {
      body.matKhauCu = this.oldPassword;
      body.matKhauMoi = this.newPassword;
    }

    this.http.put('/api/account/update', body).subscribe({
      next: (res: any) => {
        this.showMessage(res.message || '✅ Cập nhật thành công', true);
        this.oldPassword = '';
        this.newPassword = '';
        this.loadAccount();
      },
      error: (err) => {
        this.showMessage(err.error?.message || '❌ Có lỗi xảy ra khi cập nhật', false);
      }
    });
  }

  onDeactivate() {
    if (!confirm('⚠️ Bạn có chắc chắn muốn vô hiệu hóa tài khoản?')) return;

    this.http.delete('/api/account/deactivate', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    }).subscribe({
      next: () => {
        this.showMessage('🚫 Tài khoản đã bị vô hiệu hóa', true);
        setTimeout(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }, 2000);
      },
      error: err => {
        console.error('❌ Lỗi vô hiệu hóa tài khoản:', err);
        this.showMessage('❌ Không thể vô hiệu hóa tài khoản', false);
      }
    });
  }

  
  
}
