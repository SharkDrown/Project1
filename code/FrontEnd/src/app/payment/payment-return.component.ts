import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-return',

  standalone: true,

  imports: [CommonModule, RouterModule],
  templateUrl: './payment-return.component.html',
  styleUrl: './payment-return.component.css'
})
export class PaymentReturnComponent implements OnInit {
  // Trạng thái chung của giao dịch: 'success' hoặc 'failed'
  paymentStatus: 'success' | 'failed' | 'pending' = 'pending';

  // Chi tiết từ URL Query Parameters
  maPp: string | null = null;
  responseCode: string | null = null;
  // Tham số lỗi từ backend
  reason: string | null = null;
  // Thông báo hiển thị cho người dùng
  message: string = '';

  // INJECT SERVICES: ActivatedRoute và Router
  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Đăng ký theo dõi Query Parameters khi Component được khởi tạo
    this.route.queryParams.subscribe(params => {
      // 1. Lấy trạng thái từ Backend redirect
      this.paymentStatus = params['status'] === 'success' ? 'success' : 'failed';

      // 2. Lấy chi tiết
      this.maPp = params['maPp'] || 'N/A';
      this.responseCode = params['vnp_ResponseCode'] || 'N/A';
      // Lấy tham số lỗi từ Be
      this.reason = params['reason'] || null;
      // 3. Set thông báo hiển thị dựa trên trạng thái và mã lỗi
      this.setMessage(this.paymentStatus, this.responseCode, this.reason);
    });
  }

  /**
   * Dịch mã phản hồi VNPAY thành thông báo thân thiện.
   */
  setMessage(status: 'success' | 'failed' | 'pending', code: string | null, reason: string | null): void {
    if (status === 'success') {
      this.message = 'Giao dịch thanh toán phiếu phạt thành công. Vui lòng kiểm tra lại trạng thái trong mục Thông báo.';
    } else {
      // Xử lý lỗi từ Backend
      if (reason === 'invalid_signature' || reason === 'SaiChuKy') {
        this.message = 'Lỗi bảo mật: Dữ liệu giao dịch không hợp lệ (Sai chữ ký). Vui lòng không thay đổi tham số URL.';
        return;
      }
      if (reason === 'LoiCapNhatDB') {
        this.message = 'Giao dịch VNPAY thành công, nhưng lỗi xảy ra khi cập nhật trạng thái trong hệ thống. Vui lòng liên hệ quản trị viên.';
        return;
      }
      // Xử lý thông báo lỗi chi tiết dựa trên mã lỗi VNPAY (Tham khảo tài liệu VNPAY)
      switch (code) {
        case '24':
          this.message = 'Giao dịch bị hủy bởi người dùng hoặc quá thời gian thanh toán.';
          break;
        case '01':
        case '02':
          this.message = 'Giao dịch thất bại: Ngân hàng từ chối thanh toán hoặc không đủ số dư.';
          break;
        case '07':
          this.message = 'Trừ tiền thành công tại Ngân hàng, nhưng giao dịch bị lỗi (Timeout) hoặc chưa rõ kết quả.';
          break;
        default:
          this.message = 'Giao dịch thất bại. Vui lòng kiểm tra lại thông tin thanh toán.';
          break;
      }
    }
  }

  /**
   * Chuyển hướng người dùng quay lại trang Thông báo.
   */
  backToNotices(): void {
    this.router.navigate(['/notices']);
  }
}