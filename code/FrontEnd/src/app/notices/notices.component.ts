import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NoticeService, Notice, FineDetails } from '../services/notice.service';
import { FineService } from '../services/fine.service';

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

  constructor(private noticeService: NoticeService, private fineService: FineService) { }

  ngOnInit(): void {
    this.loadNotices();
  }

  loadNotices(): void {
    this.loading = true;
    this.errorMessage = '';
    this.noticeService.getMyNotices().subscribe({
      next: (data) => {
        this.notices = data;
        console.log("Dữ liệu thông báo nhận được:", this.notices);
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải thông báo:', err);
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
  // Trích xuất chi tiết phạt từ nội dung
  getFineDetails(notice: Notice): FineDetails {
    if (!notice.noiDung) {
      return { isFine: false, maPp: '' };
    }

    // Mẫu regex dựa trên chuỗi tạo ở Backend: "[PHAT] Mã PP: 123 - Lý do ABC. Số tiền: 50.000đ"
    // (\[PHAT\] Mã PP: (\d+)) : Bắt tiền tố và Mã PP
    // (.+?)\. Số tiền: : Bắt Lý do (non-greedy)
    // ([\d\.]+): Bắt Số tiền (có thể có dấu chấm hoặc phẩy)
    const pattern = /\[PHAT\] Mã PP: (\d+) - (.+?)\. Số tiền: ([\d\.]+)đ/is;
    const match = notice.noiDung.match(pattern);

    if (match) {
      const trangThai = (notice as any).trangThai || 'ChuaDong';
      return {
        isFine: true,
        maPp: match[1], // Mã PP
        lyDo: match[2].trim(), // Lý do (loại bỏ khoảng trắng thừa)
        soTienFormatted: match[3], // Số tiền đã được format (ví dụ: 50.000)
        trangThai: trangThai,
        rawContent: notice.noiDung
      };
    }

    return { isFine: false, maPp: '', trangThai: 'N/A'};
  }
  // Xử lý Đóng phạt (GỌI API VÀ CHUYỂN HƯỚNG)
  payFine(maPp: string): void {
    const maPpNumber = Number(maPp);

    if (isNaN(maPpNumber)) {
      this.errorMessage = 'Mã Phiếu Phạt không hợp lệ.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.fineService.initiateFinePayment(maPpNumber).subscribe({
      next: (response) => {
        this.loading = false;
        // ⭐️ Chuyển hướng người dùng đến URL thanh toán VNPAY do Backend trả về
        window.location.href = response.paymentUrl;
      },
      error: (err) => {
        console.error('Lỗi khởi tạo thanh toán:', err);
        // Hiển thị lỗi từ Backend (ví dụ: Phiếu phạt đã thanh toán)
        this.errorMessage = err.error?.message || 'Không thể tạo giao dịch thanh toán. Vui lòng thử lại.';
        this.loading = false;
      }
    });
  }
}
