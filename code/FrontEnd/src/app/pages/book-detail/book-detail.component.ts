import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SachService } from '../../services/sach.service';
import { Sach } from '../../models/sach.model';
import { DanhGiaSachService, DanhGia } from '../../services/danhgiasach.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

declare var AOS: any;
declare var GLightbox: any;

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PickerModule],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  sach: Sach | null = null;
  danhSachDanhGia: DanhGia[] = [];
  quantity: number = 1;
  isReviewActive = false;
  showWriteReview = false;
  newReviewText = '';
  stars = Array.from({ length: 5 });
  rating = 0;
  hoverRatingValue = 0;
  hovered: number = -1;
  showEmojiPicker = false;
  loading = false;
  error: string | null = null;

  maDg: number | null = null;
  hoTenInput: string = '';
  binhLuanInput: string = '';
  soSaoInput: number = 0;
  editingIndex: number | null = null;

  private routeSub?: Subscription;
  private beBaseUrl = 'https://localhost:7299';

  constructor(
    private route: ActivatedRoute,
    private sachService: SachService,
    private danhGiaService: DanhGiaSachService
  ) {}

  ngOnInit(): void {
    AOS.init({ duration: 1000, once: true });
    this.getMaDocGiaFromStorage();
    this.loadBookDetail();
  }

  ngAfterViewInit(): void {
    GLightbox({ selector: '.glightbox' });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  /** Lấy mã độc giả từ localStorage hoặc JWT */
  private getMaDocGiaFromStorage(): void {
    const storedmaDg = localStorage.getItem('maDg');
    if (storedmaDg) {
      this.maDg = Number(storedmaDg);
      return;
    }
    const token = localStorage.getItem('access_token');
    if (token) {
      const payload: any = this.decodeJWT(token);
      const maTk = payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload?.nameid;
      if (maTk) {
        this.maDg = Number(maTk);
        localStorage.setItem('maDg', String(this.maDg));
      }
    }
  }

  /** Lấy chi tiết sách */
  private loadBookDetail(): void {
    this.loading = true;
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) { this.error = 'Không tìm thấy mã sách.'; this.loading = false; return; }

      this.sachService.getSachById(id).subscribe({
        next: data => { this.sach = data; this.loading = false; this.loadDanhGia(); },
        error: err => { this.error = 'Không thể tải thông tin sách.'; this.loading = false; console.error(err); }
      });
    });
  }

  /** Trả về đường dẫn ảnh */
  getImageUrl(maSach?: number, format: string = 'jpg'): string {
    return maSach ? `${this.beBaseUrl}/image/books/${maSach}.${format}` : '/assets/img/no-image.jpg';
  }

  increaseQuantity() { if (this.sach && this.quantity < (this.sach.soLuong ?? 1)) this.quantity++; }
  decreaseQuantity() { if (this.quantity > 1) this.quantity--; }

  toggleReview(): void { this.isReviewActive = !this.isReviewActive; }
  toggleWriteReview(): void { this.showWriteReview = !this.showWriteReview; }
  cancelWriteReview(): void { this.showWriteReview = false; this.resetForm(); }

  private resetForm(): void {
    this.binhLuanInput = '';
    this.soSaoInput = 0;
    this.hoTenInput = '';
    this.editingIndex = null;
    this.rating = 0;
    this.hoverRatingValue = 0;
  }

  setRating(value: number) { this.rating = value; }
  hoverRating(value: number) { this.hoverRatingValue = value; }
  isStarFilled(index: number): boolean { return index < (this.hoverRatingValue || this.rating); }

  /** Load danh sách đánh giá từ backend */
  loadDanhGia(): void {
    if (!this.sach) return;

    this.danhGiaService.getDanhGiaTheoSach(this.sach.maSach).subscribe({
      next: (res: any[]) => {
        this.danhSachDanhGia = res.map((r: any) => ({ 
          maDg: r.maDg,        
          maSach: this.sach!.maSach, 
          hoTen: r.hoTen,      
          soSao: r.soSao,      
          binhLuan: r.binhLuan,
          ngayDg: r.ngayDg     
        }));
      },
      error: err => console.error('Lỗi khi tải đánh giá:', err)
    });
  }

  /** Thêm hoặc sửa bình luận */
  submitReview(): void {
    if (!this.binhLuanInput.trim() || this.soSaoInput === 0) { alert('Vui lòng nhập nội dung và chọn số sao.'); return; }
    if (!this.maDg || !this.sach) { alert('Vui lòng đăng nhập.'); return; }

    const review: DanhGia = {
      maDg: this.maDg,
      maSach: this.sach.maSach,
      hoTen: this.hoTenInput || 'Bạn',
      soSao: this.soSaoInput,
      binhLuan: this.binhLuanInput,
      ngayDg: new Date().toISOString().split('T')[0]
    };

    this.danhGiaService.themDanhGia(review).subscribe({
      next: () => {
        if (this.editingIndex !== null) {
          // Sửa bình luận
          this.danhSachDanhGia[this.editingIndex] = { ...review };
          alert('Bình luận đã được cập nhật!');
        } else {
          // Thêm mới
          this.danhSachDanhGia.unshift({ ...review });
          alert('Cảm ơn bạn đã gửi đánh giá!');
        }
        this.resetForm();
        this.showWriteReview = false;
      },
      error: err => { console.error(err); alert('Không thể gửi đánh giá.'); }
    });
  }

  /** Sửa bình luận */
  editReview(index: number): void {
    const review = this.danhSachDanhGia[index];
    if (!review) return;
    this.binhLuanInput = review.binhLuan;
    this.soSaoInput = review.soSao;
    this.hoTenInput = review.hoTen;
    this.editingIndex = index;
    this.rating = review.soSao;
    this.showWriteReview = true;
  }

  /** Xóa bình luận */
  deleteReview(index: number): void {
    const review = this.danhSachDanhGia[index];
    if (!review || !review.maDg || !review.maSach) return;
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    this.danhGiaService.deleteDanhGia(review.maDg, review.maSach).subscribe({
      next: () => {
        this.danhSachDanhGia.splice(index, 1);
        alert('Bình luận đã được xóa!');
      },
      error: err => { console.error(err); alert('Không thể xóa bình luận.'); }
    });
  }

  toggleEmojiPicker(): void { this.showEmojiPicker = !this.showEmojiPicker; }
  addEmoji(event: any): void { this.binhLuanInput += event.emoji?.native || event.emoji || ''; }

  /** Giải mã JWT để lấy maDg */
  decodeJWT(token: string): any {
    try { return JSON.parse(atob(token.split('.')[1])); } 
    catch { return null; }
  }
}
