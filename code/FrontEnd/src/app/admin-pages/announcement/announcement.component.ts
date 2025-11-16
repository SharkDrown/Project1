import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoticeService, CreateNoticeDto, Account } from '../../services/notice.service';

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './announcement.component.html',
  styleUrl: './announcement.component.css'
})
export class AnnouncementComponent implements OnInit {
  // Form data
  noiDung: string = '';
  maxLength: number = 500; // Giới hạn 500 ký tự (theo database)
  sendType: string = 'all'; // all: gửi tất cả, byRole: gửi theo vai trò, specific: tài khoản cụ thể
  targetRole: string = ''; // Admin, NhanVien, DocGia
  selectedAccountId: number | null = null;

  // Data
  accounts: Account[] = [];
  loading = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private noticeService: NoticeService) {}

  ngOnInit(): void {
    // Không cần load gì khi khởi tạo
  }

  onSendTypeChange(): void {
    this.selectedAccountId = null;
    this.accounts = [];
    this.targetRole = ''; // Reset vai trò khi đổi loại gửi
  }

  onTargetRoleChange(): void {
    this.selectedAccountId = null;
    this.accounts = [];
    if ((this.sendType === 'byRole' || this.sendType === 'specific') && this.targetRole) {
      if (this.sendType === 'specific') {
        this.loadAccounts();
      }
    }
  }

  loadAccounts(): void {
    if (!this.targetRole) return;

    this.loading = true;
    this.errorMessage = '';
    
    this.noticeService.getAccountsByRole(this.targetRole).subscribe({
      next: (data) => {
        this.accounts = data as Account[];
        this.loading = false;
        if (this.accounts.length === 0) {
          this.errorMessage = `Không có tài khoản nào với vai trò ${this.targetRole}.`;
        }
      },
      error: (err) => {
        console.error('❌ Lỗi tải danh sách tài khoản:', err);
        console.error('Chi tiết lỗi:', err.error);
        console.error('Status:', err.status);
        console.error('Status text:', err.statusText);
        
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Bạn không có quyền truy cập. Vui lòng đăng nhập lại.';
        } else if (err.status === 404) {
          this.errorMessage = 'API không tìm thấy. Vui lòng kiểm tra lại.';
        } else if (err.status === 500) {
          this.errorMessage = `Lỗi server: ${err.error?.message || 'Có lỗi xảy ra trên server'}`;
        } else {
          this.errorMessage = `Không thể tải danh sách tài khoản. ${err.error?.message || err.message || ''}`;
        }
        this.loading = false;
      }
    });
  }

  get remainingChars(): number {
    return this.maxLength - (this.noiDung?.length || 0);
  }

  get isOverLimit(): boolean {
    return (this.noiDung?.length || 0) > this.maxLength;
  }

  onNoiDungChange(): void {
    // Tự động cắt nếu vượt quá giới hạn
    if (this.noiDung && this.noiDung.length > this.maxLength) {
      this.noiDung = this.noiDung.substring(0, this.maxLength);
    }
  }

  sendNotice(): void {
    // Trim và kiểm tra rỗng
    const trimmedNoiDung = (this.noiDung || '').trim();
    if (!trimmedNoiDung) {
      this.errorMessage = 'Vui lòng nhập nội dung thông báo.';
      return;
    }

    // Kiểm tra độ dài (không được vượt quá maxLength)
    // Lưu ý: Đếm ký tự thực tế, không phải từ
    if (trimmedNoiDung.length > this.maxLength) {
      this.errorMessage = `Nội dung thông báo không được vượt quá ${this.maxLength} ký tự. Hiện tại: ${trimmedNoiDung.length} ký tự.`;
      return;
    }

    // Validation theo loại gửi
    if (this.sendType === 'specific' && !this.selectedAccountId) {
      this.errorMessage = 'Vui lòng chọn tài khoản để gửi.';
      return;
    }

    if (this.sendType === 'byRole' && !this.targetRole) {
      this.errorMessage = 'Vui lòng chọn vai trò để gửi.';
      return;
    }

    // Cập nhật noiDung với giá trị đã trim
    this.noiDung = trimmedNoiDung;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.sendType === 'all') {
      // Gửi cho TẤT CẢ tài khoản (không cần vai trò)
      this.sendToAllAccounts();
    } else if (this.sendType === 'byRole') {
      // Gửi cho tất cả tài khoản có vai trò này
      this.sendToRole(this.targetRole);
    } else if (this.sendType === 'specific') {
      // Gửi cho một tài khoản cụ thể
      this.sendToSpecificAccount();
    }
  }

  private sendToAllAccounts(): void {
    // Lấy tất cả tài khoản từ tất cả vai trò
    const roles = ['Admin', 'NhanVien', 'DocGia'];
    let allAccounts: Account[] = [];
    let completedRoles = 0;

    roles.forEach(role => {
      this.noticeService.getAccountsByRole(role).subscribe({
        next: (accounts) => {
          allAccounts = allAccounts.concat(accounts as Account[]);
          completedRoles++;
          
          if (completedRoles === roles.length) {
            if (allAccounts.length === 0) {
              this.errorMessage = 'Không có tài khoản nào để gửi.';
              this.loading = false;
              return;
            }

            this.sendMultipleNotices(allAccounts);
          }
        },
        error: (err) => {
          console.error(`Lỗi tải tài khoản ${role}:`, err);
          completedRoles++;
          if (completedRoles === roles.length) {
            if (allAccounts.length === 0) {
              this.errorMessage = 'Không thể tải danh sách tài khoản.';
              this.loading = false;
            } else {
              this.sendMultipleNotices(allAccounts);
            }
          }
        }
      });
    });
  }

  private sendToRole(role: string): void {
    this.noticeService.getAccountsByRole(role).subscribe({
      next: (accounts) => {
        const accountList = accounts as Account[];
        if (accountList.length === 0) {
          this.errorMessage = `Không có tài khoản nào với vai trò ${role}.`;
          this.loading = false;
          return;
        }
        this.sendMultipleNotices(accountList);
      },
      error: (err) => {
        console.error('Lỗi tải danh sách tài khoản:', err);
        this.errorMessage = 'Không thể tải danh sách tài khoản.';
        this.loading = false;
      }
    });
  }

  private sendToSpecificAccount(): void {
    const notice: CreateNoticeDto = {
      noiDung: this.noiDung,
      maTk: this.selectedAccountId!
    };

    this.noticeService.createNotice(notice).subscribe({
      next: (res) => {
        this.successMessage = 'Gửi thông báo thành công!';
        this.resetForm();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Lỗi gửi thông báo:', err);
        console.error('Chi tiết lỗi:', err.error);
        console.error('Status:', err.status);
        this.errorMessage = err.error?.message || 'Không thể gửi thông báo. Vui lòng thử lại.';
        this.loading = false;
      }
    });
  }

  private sendMultipleNotices(accounts: Account[]): void {
    const notices: CreateNoticeDto[] = accounts.map(acc => ({
      noiDung: this.noiDung,
      maTk: acc.maTk
    }));

    this.noticeService.sendToMultiple(notices).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || `Đã gửi thông báo cho ${notices.length} tài khoản thành công!`;
        this.resetForm();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Lỗi gửi thông báo hàng loạt:', err);
        console.error('Chi tiết lỗi:', err.error);
        console.error('Status:', err.status);
        console.error('Response:', err);
        this.errorMessage = err.error?.message || err.message || 'Không thể gửi thông báo. Vui lòng thử lại.';
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.noiDung = '';
    this.sendType = 'all';
    this.targetRole = '';
    this.selectedAccountId = null;
    this.accounts = [];
    this.loading = false;
    this.errorMessage = '';
  }
}
