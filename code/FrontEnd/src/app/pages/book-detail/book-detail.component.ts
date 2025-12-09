import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SachService } from '../../services/sach.service';
import { Sach } from '../../models/sach.model';
import { DanhGiaSachService, DanhGia } from '../../services/danhgiasach.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { UserBorrowService } from '../../services/user-borrow.service';
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
  currentPage = 1;           
  pageSize = 5;               
  pagedReviews: DanhGia[] = []; // Danh sách hiển thị cho trang hiện tại
  totalPages = 0;
  pages: number[] = [];  
  visiblePages: (number | string)[] = [];
  quantity: number = 1;
  isReviewActive = false;
  showWriteReview = false;
  newReviewText = '';
  stars = Array.from({ length: 5 });
  rating = 0;
  hoverRatingValue = 0;
  hovered: number = -1;
  showEmojiPicker = false;
  emojiPopupStyle: any = {};
  isLoggedIn: boolean = false;

  loading = false;
  error: string | null = null;

  maDg: number | null = null;
  currentUserMaDg: number | null = null;
  currentUserHoTen: string | null = null;
  hoTenInput: string = '';
  // binhLuanInput: string = '';
  // soSaoInput: number = 0;
  reviewText: string = '';
  reviewRating: number = 0;
  editingIndex: number | null = null;
  // Thống kê đánh giá sách
  averageRating: number = 0;
  totalReviews: number = 0;
  ratingCounts = [0, 0, 0, 0, 0];
  private routeSub?: Subscription;
  private beBaseUrl = 'https://localhost:7299';

  constructor(
    private route: ActivatedRoute,
    private sachService: SachService,
    private danhGiaService: DanhGiaSachService,
    private userBorrowService: UserBorrowService
  ) {}

  ngOnInit(): void {
    AOS.init({ duration: 1000, once: true });
    this.getMaDocGiaFromStorage();
    // đảm bảo lấy từ localStorage (ưu tiên maDg, fallback maTK)
    // const storedMaDg = localStorage.getItem('maDg') || localStorage.getItem('maDG') || localStorage.getItem('maTK');
    // this.currentUserMaDg = storedMaDg ? Number(storedMaDg) : null;
    this.currentUserMaDg = Number(localStorage.getItem('maDg'));
    this.currentUserHoTen = localStorage.getItem('hoTen') || 'Khách';
    //Kiểm tra đăng nhập
    this.isLoggedIn = !!localStorage.getItem('access_token'); 
    console.log('currentUserMaDg initialized =', this.currentUserMaDg);
     this.loadBookDetail();
  }

  ngAfterViewInit(): void {
    GLightbox({ selector: '.glightbox' });
    console.log('averageRating (type):', typeof this.averageRating, this.averageRating);

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
  // Phân trang
  changePage(page: number): void {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.updatePagedReviews();
  }

  private updatePagedReviews(): void {
    if (!this.danhSachDanhGia) return;

    this.totalPages = Math.ceil(this.danhSachDanhGia.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedReviews = this.danhSachDanhGia.slice(startIndex, endIndex);

    this.updateVisiblePages();
  }

  private updateVisiblePages(): void {
    const total = this.totalPages;
    const current = this.currentPage;

    // Trường hợp ít hơn hoặc bằng 10 trang: hiển thị hết
    if (total <= 10) {
      this.visiblePages = Array.from({ length: total }, (_, i) => i + 1);
      return;
    }

    // Mặc định
    const firstBlock = [1, 2, 3, 4, 5];
    const lastBlock = [total - 4, total - 3, total - 2, total - 1, total];

    if (current <= 5) {
      this.visiblePages = [...firstBlock, '...', ...lastBlock];
    } else if (current >= total - 4) {
      this.visiblePages = [...firstBlock, '...', ...lastBlock];
    } else {
      this.visiblePages = [
        ...firstBlock, current, ...lastBlock
      ];
    }
  }

  onPageClick(p: number | string, event: Event): void {
    event.preventDefault();
    if (typeof p !== 'number' || p === this.currentPage) return;
    this.currentPage = p;
    this.updatePagedReviews();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedReviews();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedReviews();
    }
  }

  // Phân trang
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
    this.reviewText = '';
    this.reviewRating = 0;
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
          maDg: Number(r.MaDg ?? r.maDg ?? r.maDG ?? 0),
          maSach: Number(this.sach!.maSach),
          hoTen: r.hoTen,      
          soSao: r.soSao,      
          binhLuan: r.binhLuan,
          ngayDg: r.ngayDg     
        }));
        this.calculateRatingStats();
        this.updatePagedReviews();

        console.log('Loaded reviews:', this.danhSachDanhGia);
      },
      error: err => console.error('Lỗi khi tải đánh giá:', err)
    });
  }

  /** Thêm hoặc sửa bình luận */
  submitReview(): void {
    if (!this.reviewText.trim() || this.reviewRating === 0) { alert('Vui lòng nhập nội dung và chọn số sao.'); return; }
    const token = localStorage.getItem('access_token');
    const maDgLocal = localStorage.getItem('maDg');
    if (!token || !maDgLocal) { alert('Vui lòng đăng nhập để bình luận'); return; }
    const maDg = Number(maDgLocal);
    if (!this.sach) {
      alert('Không xác định được sách để bình luận.');
      return;
    }
    //const hoTenLocal = localStorage.getItem('hoTen') ||  'Bạn';
    const review: DanhGia = {
      maDg: this.currentUserMaDg!, 
      maSach: this.sach.maSach,
      hoTen: this.currentUserHoTen!,
      soSao: this.reviewRating,
      binhLuan: this.reviewText,
      ngayDg: new Date().toISOString().split('T')[0]
    };

    this.danhGiaService.themDanhGia(review).subscribe({
      next: (res:any) => {
         const newReview = res.data || review;

      // Gán thông tin người dùng hiện tại
      newReview.maDg = this.currentUserMaDg!;
      newReview.hoTen = this.currentUserHoTen!;

      // Kiểm tra xem người này đã có bình luận chưa
      const existingIndex = this.danhSachDanhGia.findIndex(r => r.maDg === this.currentUserMaDg);

      if (existingIndex !== -1) {
        // Cập nhật bình luận cũ
        this.danhSachDanhGia[existingIndex] = newReview;
        alert('Bình luận đã được cập nhật!');
      } else {
        //  Thêm bình luận mới
        this.danhSachDanhGia.unshift(newReview);
        alert('Cảm ơn bạn đã gửi đánh giá!');
      }

      // Cập nhật thống kê và phân trang ngay
      this.calculateRatingStats();
      this.updatePagedReviews();

      // Reset form
      this.resetForm();
      this.showWriteReview = false;
    },
    error: err => {
      console.error(err);
      alert('Không thể gửi đánh giá.'); }
    });
  }

  /** Sửa bình luận */
  editReview(index: number): void {
    const review = this.danhSachDanhGia[index];
    if (!review) return;
    this.reviewText = review.binhLuan;
    this.reviewRating = review.soSao;
    this.hoTenInput = review.hoTen;
    this.editingIndex = index;
    this.rating = review.soSao;
    this.showWriteReview = true;
  }

  /** Xóa bình luận */
  deleteReview(index: number): void {
  const review = this.danhSachDanhGia[index];
   console.log('Deleting review:', review, 'currentUserMaDg=', this.currentUserMaDg);
  if (!review) return;

  if (!review.maDg || !review.maSach) {
    console.error('Thiếu maDg hoặc maSach trong review:', review);
    alert('Không thể xác định bình luận để xóa.');
    return;
  }

  if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

  this.danhGiaService.deleteDanhGia(review.maSach, review.maDg).subscribe({
    next: () => {
      this.danhSachDanhGia.splice(index, 1);
      alert('Bình luận đã được xóa!');
      this.calculateRatingStats();
      this.updatePagedReviews();
    },
    error: err => {
      console.error('Lỗi khi xóa bình luận:', err);
      alert('Không thể xóa bình luận.');
    }
  });
}


  toggleEmojiPicker(event?: MouseEvent): void {
   this.showEmojiPicker = !this.showEmojiPicker;
    if (!this.showEmojiPicker && event && event.currentTarget) {
      try {
        const btn = event.currentTarget as HTMLElement;
        const rect = btn.getBoundingClientRect();
        
        this.emojiPopupStyle = {
          position: 'fixed',
          top: `${Math.round(rect.bottom + 8)}px`,
          left: `${Math.round(rect.left)}px`,
          zIndex: 999999,
        };
      } catch (e) {
       
        this.emojiPopupStyle = { position: 'fixed', bottom: '6rem', right: '2rem', zIndex: 999999 };
      }
    }
    

   
     else {
       this.emojiPopupStyle = {};
     }
  }
  addEmoji(event: any): void { this.reviewText += event.emoji?.native || event.emoji || ''; }

  /** Giải mã JWT để lấy maDg */
  decodeJWT(token: string): any {
    try { return JSON.parse(atob(token.split('.')[1])); } 
    catch { return null; }
  }
  private calculateRatingStats() {
        const reviews = this.danhSachDanhGia;
        if (!reviews || reviews.length === 0) {
          this.averageRating = 0;
          this.totalReviews = 0;
          this.ratingCounts = [0, 0, 0, 0, 0];
          return;
        }

        this.totalReviews = reviews.length;
        this.ratingCounts = [0, 0, 0, 0, 0];

        let totalStars = 0;
        for (const r of reviews) {
          const stars = r.soSao || 0;
          totalStars += stars;
          if (stars >= 1 && stars <= 5) this.ratingCounts[stars - 1]++;
        }

        this.averageRating = +(totalStars / reviews.length).toFixed(1);
       
  }
  
  placeOrder() {
  if (!this.sach || this.quantity <= 0) return;

  this.userBorrowService.createBorrow(this.sach.maSach, this.quantity)
    .subscribe({
      next: borrow => {
        alert('Đặt sách thành công!');
        // Giảm số lượng sách còn lại
        this.sach!.soLuong = (this.sach!.soLuong ?? 0) - this.quantity;
        // Reset số lượng đặt về 1
        this.quantity = 1;
      },
      error: err => {
        const msg = err.error?.message || 'Đặt sách thất bại!';
        alert(msg);
      }
    });
}

}
