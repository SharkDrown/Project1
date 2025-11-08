import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  account: any = {
    tenDangNhap: '',
    hoTen: '',
    email: '',
    vaiTro: '',
    chucVu: '',
    matKhauCu: '',
    matKhauMoi: ''
  };

  showCreateForm: boolean = false;
  newAccount: any = {
    vaiTro: '',
    tenDangNhap: '',
    matKhau: '',
    hoTen: '',
    email: '',
    soDT: '',
    chucVu: ''
  };

  message: string = '';
  isSuccess: boolean = true;
  showToast: boolean = false; 

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAccountInfo();
  }

  //Hiển thị toast (auto ẩn sau 3s) 
  showMessage(msg: string, success: boolean = true) {
    this.showToast = false; // ẩn toast cũ (nếu có)
    setTimeout(() => {
      this.message = msg;
      this.isSuccess = success;
      this.showToast = true;

      setTimeout(() => {
        this.showToast = false; // tự động ẩn sau 3s
      }, 3000);
    }, 50);
  }

  // Lấy thông tin tài khoản hiện tại 
  loadAccountInfo() {
  const token = localStorage.getItem('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  this.http.get('https://localhost:7299/api/account/me', { headers }).subscribe({
    next: (res: any) => {
      this.account = { ...this.account, ...res };
    },
    error: (err) => {
      console.error('❌ Lỗi tải thông tin tài khoản:', err);
      this.showMessage('Không thể tải thông tin tài khoản', false);
    }
  });
  }


  //  Cập nhật thông tin cá nhân 
  onUpdate() {
    if ((this.account.matKhauCu && !this.account.matKhauMoi) ||
        (!this.account.matKhauCu && this.account.matKhauMoi)) {
      this.showMessage('⚠️ Phải nhập cả mật khẩu cũ và mật khẩu mới', false);
      return;
    }

    if (this.account.matKhauMoi && this.account.matKhauMoi.length < 8) {
      this.showMessage('⚠️ Mật khẩu mới phải có ít nhất 8 ký tự', false);
      return;
    }

    this.http.put('/api/account/update', this.account).subscribe({
      next: (res: any) => {
        this.showMessage(res.message || '✅ Cập nhật thành công', true);
        this.account.matKhauCu = '';
        this.account.matKhauMoi = '';
      },
      error: (err) => {
        console.error('❌ Lỗi cập nhật:', err);
        this.showMessage(err.error?.message || '❌ Cập nhật thất bại', false);
      }
    });
  }

  //  Vô hiệu hoá tài khoản 
  onDeactivate() {
    if (!confirm('⚠️ Bạn có chắc chắn muốn vô hiệu hóa tài khoản này không?')) return;

    this.http.delete('/api/account/deactivate').subscribe({
      next: (res: any) => {
        this.showMessage(res.message || '✅ Tài khoản đã bị vô hiệu hóa', true);
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Lỗi vô hiệu hóa:', err);
        this.showMessage(err.error?.message || '❌ Không thể vô hiệu hóa tài khoản', false);
      }
    });
  }

  // = Hiện / ẩn form tạo tài khoản
  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    this.message = '';
    if (this.showCreateForm) {
      this.newAccount = {
        vaiTro: '',
        tenDangNhap: '',
        matKhau: '',
        hoTen: '',
        email: '',
        soDT: '',
        chucVu: ''
      };
    }
  }

  // Tạo tài khoản mới (Admin tạo Admin/Nhân viên) 
  onCreateAccount() {
    const acc = this.newAccount;

    if (!acc.vaiTro || !acc.tenDangNhap || !acc.matKhau || !acc.email || !acc.soDT) {
      this.showMessage('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc.', false);
      return;
    }

    if (acc.matKhau.length < 8) {
      this.showMessage('⚠️ Mật khẩu phải có ít nhất 8 ký tự.', false);
      return;
    }

    let api$: Observable<any>;
    if (acc.vaiTro === 'Admin') api$ = this.authService.createAdmin(acc);
    else if (acc.vaiTro === 'NhanVien') api$ = this.authService.createStaff(acc);
    else {
      this.showMessage('❌ Vai trò không hợp lệ (chỉ Admin hoặc Nhân viên).', false);
      return;
    }

    api$.subscribe({
      next: (res) => {
        this.showMessage(res.message || '✅ Tạo tài khoản thành công!', true);
        this.showCreateForm = false;
      },
      error: (err) => {
        console.error('❌ Lỗi tạo tài khoản:', err);
        this.showMessage(err.error?.message || '❌ Tạo tài khoản thất bại.', false);
      }
    });
  }

  //  Đăng xuất 
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get isAdmin(): boolean {
    return this.authService.getRole() === 'Admin';
  }
}
