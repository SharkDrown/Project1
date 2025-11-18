import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

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

  employees: any[] = [];

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
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadAccountInfo();

    
  window.addEventListener('clearSearch', () => {
    this.loadEmployees();    // Hiện lại toàn bộ nhân viên
  });
    // Nhận từ khóa tìm kiếm
  window.addEventListener('searchUpdated', () => {
    this.onSearchEmployee();
  });
  }


  onSearchEmployee() {
  const keyword = localStorage.getItem('search_keyword');
  if (!keyword) return;

  const token = localStorage.getItem('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  this.http.get(`/api/account/search-staff?keyword=${keyword}`, { headers })
    .subscribe({
      next: (res: any) => {
        this.employees = res || [];
      },
      error: (err) => {
        console.error(err);
      }
    });
}




  // TOAST
  showMessage(msg: string, success: boolean = true) {
    this.showToast = false;
    setTimeout(() => {
      this.message = msg;
      this.isSuccess = success;
      this.showToast = true;

      setTimeout(() => this.showToast = false, 3000);
    }, 50);
  }

  // LOAD ACCOUNT
  loadAccountInfo() {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get('/api/account/me', { headers }).subscribe({
      next: (res: any) => {
        this.account = { ...this.account, ...res };
        if (this.account.vaiTro === 'Admin') {
          this.loadEmployees();
        }
      },
      error: () => {
        this.showMessage('Không thể tải thông tin tài khoản', false);
      }
    });
  }

  // LOAD ALL STAFF
  loadEmployees() {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get('/api/account/all-staff', { headers }).subscribe({
      next: (res: any) => this.employees = res || [],
      error: () => console.error('❌ Lỗi tải danh sách nhân viên')
    });
  }

  // UPDATE STAFF BY ADMIN
  onUpdateEmployee(nv: any) {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    const payload = {
      maNV: nv.maNv,
      chucVu: nv.chucVu
    };

    this.http.put('/api/account/update-staff', payload, { headers }).subscribe({
      next: (res: any) => {
        this.showMessage(res.message || 'Cập nhật chức vụ thành công', true);
        this.loadEmployees();
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Không thể cập nhật nhân viên', false);
      }
    });
  }

  // DEACTIVATE STAFF BY ADMIN
  onDeactivateStaff(maTK: number) {
    if (!confirm("⚠️ Bạn có chắc muốn vô hiệu hóa tài khoản nhân viên này không?")) return;

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    // 🔥 ĐÚNG URL BACKEND
    this.http.delete(`/api/account/deactivate-staff/${maTK}`, { headers }).subscribe({
      next: (res: any) => {
        this.showMessage(res.message || "Đã vô hiệu hóa nhân viên");
        this.loadEmployees();
      },
      error: (err) => {
        this.showMessage(err.error?.message || "Không thể vô hiệu hóa nhân viên", false);
      }
    });
  }

  // UPDATE SELF
  onUpdate() {
    if ((this.account.matKhauCu && !this.account.matKhauMoi) ||
        (!this.account.matKhauCu && this.account.matKhauMoi)) {
      this.showMessage("⚠️ Phải nhập cả mật khẩu cũ và mật khẩu mới", false);
      return;
    }

    if (this.account.matKhauMoi && this.account.matKhauMoi.length < 8) {
      this.showMessage("⚠️ Mật khẩu mới phải ≥ 8 ký tự", false);
      return;
    }

    this.http.put('/api/account/update', this.account).subscribe({
      next: (res: any) => {
        this.showMessage(res.message || "Cập nhật thành công");
        this.account.matKhauCu = '';
        this.account.matKhauMoi = '';
      },
      error: (err) => {
        this.showMessage(err.error?.message || "Cập nhật thất bại", false);
      }
    });
  }

  // SELF DEACTIVATE
  onDeactivate() {
    if (!confirm("⚠️ Bạn có chắc muốn vô hiệu hóa tài khoản này không?")) return;

    this.http.delete('/api/account/deactivate').subscribe({
      next: (res: any) => {
        this.showMessage(res.message || "Đã vô hiệu hóa tài khoản");
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.showMessage(err.error?.message || "Không thể vô hiệu hóa tài khoản", false);
      }
    });
  }

  // CREATE NEW ACCOUNT
  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
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

  onCreateAccount() {
    const acc = this.newAccount;

    if (!acc.vaiTro || !acc.tenDangNhap || !acc.matKhau || !acc.email || !acc.soDT) {
      this.showMessage("⚠️ Vui lòng điền đủ thông tin", false);
      return;
    }

    if (acc.matKhau.length < 8) {
      this.showMessage("⚠️ Mật khẩu phải ≥ 8 ký tự", false);
      return;
    }

    let api$: Observable<any>;

    if (acc.vaiTro === "Admin") api$ = this.authService.createAdmin(acc);
    else if (acc.vaiTro === "NhanVien") api$ = this.authService.createStaff(acc);
    else {
      this.showMessage("Vai trò không hợp lệ", false);
      return;
    }

    api$.subscribe({
      next: (res: any) => {
        this.showMessage(res.message || "Tạo tài khoản thành công", true);
        this.showCreateForm = false;
        this.loadEmployees();
      },
      error: (err) => {
        this.showMessage(err.error?.message || "Không thể tạo tài khoản", false);
      }
    });
  }

  // LOGOUT
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get isAdmin(): boolean {
    return this.authService.getRole() === 'Admin';
  }
}
