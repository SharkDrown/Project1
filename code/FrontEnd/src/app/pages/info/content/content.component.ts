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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAccount();
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
      }
    });
  }

  onUpdate() {
    // ✅ Nếu chỉ nhập 1 trong 2 ô mật khẩu
    if ((this.oldPassword && !this.newPassword) || (!this.oldPassword && this.newPassword)) {
      this.message = "Vui lòng nhập cả mật khẩu cũ và mật khẩu mới.";
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

    // ✅ Nếu có nhập cả 2 mật khẩu
    if (this.oldPassword && this.newPassword) {
      body.matKhauCu = this.oldPassword;
      body.matKhauMoi = this.newPassword;
    }

    this.http.put('/api/account/update', body).subscribe({
      next: (res: any) => {
        this.message = res.message || "Cập nhật thành công";
        this.oldPassword = '';
        this.newPassword = '';
        this.loadAccount(); // reload lại dữ liệu sau khi cập nhật
      },
      error: (err) => {
        this.message = err.error.message || "Có lỗi xảy ra khi cập nhật";
      }
    });
  }

  onDeactivate() {
    if (!confirm('Bạn có chắc chắn muốn vô hiệu hóa tài khoản?')) return;

    this.http.delete('/api/account/deactivate', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    }).subscribe({
      next: () => {
        alert('🚫 Tài khoản đã bị vô hiệu hóa');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      },
      error: err => {
        console.error('❌ Lỗi vô hiệu hóa tài khoản:', err);
      }
    });
  }
}
