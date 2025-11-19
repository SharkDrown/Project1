import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NoticeService, Notice } from '../services/notice.service';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notices.component.html',
  styleUrl: './notices.component.css'
})
export class NoticesComponent implements OnInit {
  notices: Notice[] = [];
  loading = false;
  errorMessage: string = '';

  constructor(private noticeService: NoticeService) {}

  ngOnInit(): void {
    this.loadNotices();
  }

  loadNotices(): void {
    this.loading = true;
    this.errorMessage = '';
    this.noticeService.getMyNotices().subscribe({
      next: (data) => {
        this.notices = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Lỗi tải thông báo:', err);
        console.error('Chi tiết lỗi:', err.error);
        console.error('Status:', err.status);
        
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Bạn không có quyền truy cập. Vui lòng đăng nhập lại.';
        } else {
          this.errorMessage = err.error?.message || 'Không thể tải thông báo. Vui lòng thử lại.';
        }
        this.loading = false;
      }
    });
  }

  deleteNotice(notice: Notice): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa thông báo này?`)) {
      return;
    }

    this.loading = true;
    this.noticeService.deleteNotice(notice.maTb).subscribe({
      next: () => {
        this.loadNotices();
      },
      error: (err) => {
        console.error('Lỗi xóa thông báo:', err);
        this.errorMessage = err.error?.message || 'Không thể xóa thông báo.';
        this.loading = false;
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  }
}
