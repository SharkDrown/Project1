import { Component, OnInit, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule} from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { SachService } from '../../services/sach.service';
import { Sach } from '../../models/sach.model';
import { PagedResult } from '../../models/pagedresult.model';
import { DanhGiaSachService, DanhGia } from '../../services/danhgiasach.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  pagedSaches: Sach[] = [];
  currentPage = 1;
  pageSize = 4;
  totalPages = 0;
  totalCount = 0;
  totalPagesArray: number[] = [];
  visiblePages: (number | string)[] = [];
  averageRatings: { [maSach: number]: number } = {};
  loading = false;
  private beBaseUrl = 'https://3b39a38f9f08.ngrok-free.app';
  newsList: any[] = [];
  constructor(private http: HttpClient, private sachService: SachService, private danhGiaSachService: DanhGiaSachService) {}

  ngOnInit() {
    // Nếu sau này muốn dùng lại RSS XML thì bật lại phần loadRSS()
    this.loadPage(1);
    this.loadNews(); 
  }
  loadNews() {
    this.http.get<any[]>('assets/data/news.json').subscribe({
      next: data => this.newsList = data,
      error: err => console.error('Không thể tải tin tức:', err)
    });
  }
  ngAfterViewInit() {
  
    // const script = document.createElement('script');
    // script.src = 'https://widget.rss.app/v1/imageboard.js';
    // script.type = 'text/javascript';
    // script.async = true;
    // script.onload = () => {
    //     const board = document.querySelector('rssapp-imageboard');
    //     if (board) board.classList.add('rssapp-loaded');
    //     AOS.refresh();
    // };
    // document.body.appendChild(script);
  }
  /** Load sách theo trang */
  loadPage(page: number) {
    this.loading = true;
    this.sachService.searchSaches('', page, this.pageSize, []).subscribe({
      next: (result: PagedResult<Sach>) => {
        this.pagedSaches = result.data;
        this.totalCount = result.totalCount;
        this.totalPages = result.totalPages;
        this.currentPage = page;
        this.loading = false;
        this.updateVisiblePages();
        // Them vao
         this.pagedSaches.forEach((sach) => {
          this.danhGiaSachService.getDanhGiaTheoSach(sach.maSach).subscribe({
            next: (danhGias: DanhGia[]) => {
              if (danhGias && danhGias.length > 0) {
                const total = danhGias.reduce((sum, dg) => sum + dg.soSao, 0);
                const avg = total / danhGias.length;
                this.averageRatings[sach.maSach] = parseFloat(avg.toFixed(1));
               
              } else {
                this.averageRatings[sach.maSach] = 0;
                
              }
            },
            error: (err: any) => {
              console.error('Lỗi tải đánh giá cho sách', sach.maSach, err);
              this.averageRatings[sach.maSach] = 0;
             
            }
          });
        });
        // Them vao
      },
      error: (err) => {
        console.error('Lỗi khi tải sách:', err);
        this.loading = false;
      }
    });
  }

  /** 🔹 Tạo mảng số trang để hiển thị */
  updateTotalPagesArray() {
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  /** 🔹 Trả về URL hình ảnh sách */
  getImageUrl(maSach: number, format: string): string {
    return `${this.beBaseUrl}/image/books/${maSach}.${format}`;
  }

  /** 🔹 Điều hướng trang */
  prevPage() {
    if (this.currentPage > 1) this.loadPage(this.currentPage - 1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.loadPage(this.currentPage + 1);
  }

  goToPage(page: number) {
    if (page !== this.currentPage) this.loadPage(page);
  }

  changePage(page: number) {
     if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadPage(page);
        this.updateVisiblePages();
  }
  onPageClick(p: number | string, event: Event) {
      event.preventDefault();
      if (typeof p === 'number') {
        this.changePage(p);
      }
  }

   updateVisiblePages() {
  const total = this.totalPages;
  const current = this.currentPage;
  const visible: (number | string)[] = [];

  const firstBlock = [1, 2, 3, 4, 5];
  const lastBlock = [total - 4, total - 3, total - 2, total - 1, total];

  // Nếu tổng số trang <= 10 thì hiển thị tất cả
  if (total <= 10) {
    this.visiblePages = Array.from({ length: total }, (_, i) => i + 1);
    return;
  }

  // Nếu ở đầu (1–5) hoặc cuối (16–20)
  if (current <= 5 || current >= total - 4) {
    this.visiblePages = [...firstBlock, '...', ...lastBlock];
  } else {
    // Ở giữa (6–15)
    this.visiblePages = [...firstBlock, current, ...lastBlock];
  }
}

}
/*
  news1: https://neulib.neu.edu.vn/news/nho-ai-ro-bot-nhieu-thu-vien-singapore-khong-con-thu-cong-moc-meo-tran-tuc-nua
  news2: https://neulib.neu.edu.vn/news/thu-vien-alexandria-luu-giu-tinh-hoa-tri-thuc-thoi-co-dai
  news3: https://neulib.neu.edu.vn/news/thu-vien-lon-nhat-the-gioi-danh-cho-thieu-nhi-tai-nga-sap-co-tu-sach-tieng-viet
  news4: https://neulib.neu.edu.vn/news/tuoi-tre-startup-award-skoolib-va-hanh-trinh-tu-ke-sach-nho-den-chuyen-doi-so-thu-vien
  news5: https://neulib.neu.edu.vn/news/ha-noi-nang-cao-hieu-qua-hoat-dong-cua-thu-vien-so-trong-truong-hoc
*/


