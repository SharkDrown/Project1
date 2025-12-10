import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
  Math = Math; // Expose Math để dùng trong template
  isAdminView = false; // Kiểm tra xem có phải admin view không

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
  get paginatedNotices(): Notice[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.notices.slice(start, end);
  }
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  constructor(
    private noticeService: NoticeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Kiểm tra xem có phải admin route không
    const currentUrl = this.router.url;
    // URL sẽ là /admin/admin/notices khi ở admin layout
    this.isAdminView = currentUrl.startsWith('/admin/admin/') || currentUrl.startsWith('/admin/notices');
    this.loadNotices();
  }

  loadNotices(): void {
    this.loading = true;
    this.errorMessage = '';
    
    // Admin view: lấy tất cả thông báo, User view: lấy thông báo của mình
    const noticeObservable = this.isAdminView 
      ? this.noticeService.getAllNotices()
      : this.noticeService.getMyNotices();
    
    noticeObservable.subscribe({
      next: (data) => {
        this.notices = data;
        this.totalItems = data?.length || 0;
        this.currentPage = 1; // Reset về trang đầu khi load lại
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải thông báo:', err);
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Bạn không có quyền truy cập. Vui lòng đăng nhập lại.';
        } else {
          this.errorMessage = err.error?.message || 'Không thể tải thông báo. Vui lòng thử lại.';
        }
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Scroll to top khi chuyển trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  deleteNotice(notice: Notice): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa thông báo này?`)) {
      return;
    }

    this.loading = true;
    this.noticeService.deleteNotice(notice.maTb).subscribe({
      next: () => {
        // Xóa khỏi mảng local thay vì load lại toàn bộ
        this.notices = this.notices.filter(n => n.maTb !== notice.maTb);
        this.totalItems = this.notices.length;
        // Điều chỉnh trang hiện tại nếu cần
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        }
        this.loading = false;
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
