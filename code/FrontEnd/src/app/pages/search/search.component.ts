import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs';
import { SachService } from '../../services/sach.service';
import { Sach } from '../../models/sach.model';
import { TheLoaiWithCount } from '../../models/theloaiwithcount.model';
import { PagedResult } from '../../models/pagedresult.model';
import { DanhGiaSachService, DanhGia } from '../../services/danhgiasach.service';



declare var AOS: any;
declare var GLightbox: any;
declare var Drift: any;
declare var PureCounter: any;
declare var Swiper: any;

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
  theLoais: TheLoaiWithCount[] = [];
  filteredTheLoais: TheLoaiWithCount[] = [];
  searchTheLoaiTerm: string = '';
  selectedTheLoaiIds: string[] = [];

  searchControl = new FormControl(''); // Ô nhập tên sách
  pagedSaches: Sach[] = [];

  currentPage = 1;
  pageSize = 9;
  totalPages = 0;
  totalCount = 0;
  
  visiblePages: (number | string)[] = [];
  averageRatings: { [maSach: number]: number } = {};
  reviewCounts: { [maSach: number]: number } = {};
  
  sortBy: string = 'asc'; // mặc định: Từ A -> Z

  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private beBaseUrl = 'https://3b39a38f9f08.ngrok-free.app';

  constructor(private sachService: SachService, private danhGiaSachService: DanhGiaSachService) {}

  ngOnInit() {
    AOS.init({ duration: 1000, once: true });
    new PureCounter();

    // Gọi load thể loại ban đầu
    this.loadTheLoais();

    // Load trang đầu tiên (hiển thị toàn bộ sách)
    this.loadPage(1);
    
    // Lắng nghe gõ từ khóa (tự động tìm sau 300ms)
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        this.currentPage = 1;
        return this.loadPagedResult(query || '', this.currentPage);
      })
    ).subscribe();
    
  }

  /** Gọi BE lấy dữ liệu sách (tên, phân trang, thể loại) */
  private loadPagedResult(query: string, page: number, theLoaiIds: string[] = [],sortBy: string = this.sortBy): Observable<PagedResult<Sach>> {
    this.loading = true;
    this.error = null;

    return this.sachService.searchSaches(query, page, this.pageSize, theLoaiIds, sortBy).pipe(
      switchMap((pagedResult: PagedResult<Sach>) => {
        this.pagedSaches = pagedResult.data;
        this.totalCount = pagedResult.totalCount;
        this.totalPages = pagedResult.totalPages;
        this.currentPage = page;
        this.loading = false;
        this.updateVisiblePages();
        if (this.sortBy === 'available') {
        this.pagedSaches = this.pagedSaches.filter(sach => (sach.soLuong ?? 0) > 0);
      }
        this.pagedSaches.forEach((sach) => {
          this.danhGiaSachService.getDanhGiaTheoSach(sach.maSach).subscribe({
            next: (danhGias: DanhGia[]) => {
              if (danhGias && danhGias.length > 0) {
                const total = danhGias.reduce((sum, dg) => sum + dg.soSao, 0);
                const avg = total / danhGias.length;
                this.averageRatings[sach.maSach] = parseFloat(avg.toFixed(1));
                this.reviewCounts[sach.maSach] = danhGias.length;
              } else {
                this.averageRatings[sach.maSach] = 0;
                this.reviewCounts[sach.maSach] = 0;
              }
            },
            error: (err: any) => {
              console.error('Lỗi tải đánh giá cho sách', sach.maSach, err);
              this.averageRatings[sach.maSach] = 0;
              this.reviewCounts[sach.maSach] = 0;
            }
          });
        });

        return of(pagedResult);
      }),
      catchError((err) => {
        this.error = 'Lỗi khi tìm kiếm sách: ' + err.message;
        this.loading = false;
        this.pagedSaches = [];
        return of({ data: [], totalCount: 0, page: 1, size: this.pageSize, totalPages: 0 } as PagedResult<Sach>);
      })
    );
  }
  // Sắp xếp theo
  onSortChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.sortBy = select.value;
    this.currentPage = 1;

    const query = this.searchControl.value || '';
    if (this.sortBy === 'available') {
    // Lọc sách có thể mượn (số lượng > 0)
    this.pagedSaches = this.pagedSaches.filter(sach => (sach.soLuong ?? 0) > 0);

  } else {
    // 🔹 Các loại sort khác (A-Z, Z-A, Rating) gọi lại BE
    this.loadPagedResult(query, this.currentPage, this.selectedTheLoaiIds, this.sortBy).subscribe();
  }
  }


  //Them vao
   prevPage(): void {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  onPageClick(p: number | string, event: Event): void {
    event.preventDefault();
    if (typeof p === 'number') {
      this.changePage(p);
    }
  }
  // Them vao
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      const query = this.searchControl.value || '';
      this.loadPagedResult(query, page, this.selectedTheLoaiIds, this.sortBy).subscribe();
    }
  }
  // Them vao
  private updateVisiblePages(): void {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 6) {
      this.visiblePages = Array.from({ length: total }, (_, i) => i + 1);
      return;
    }

    const firstBlock = [1, 2, 3];
    const lastBlock = [total - 2, total - 1, total];

    if (current <= 3) {
      this.visiblePages = [...firstBlock, '...', ...lastBlock];
    } else if (current >= total - 2) {
      this.visiblePages = [...firstBlock, '...', ...lastBlock];
    } else {
      this.visiblePages = [
        ...firstBlock,
      
        current,
       
        ...lastBlock
      ];
    }
  }

  /** "Tìm kiếm" */
  onSearch() {
    const query = this.searchControl.value?.trim() || '';
    this.currentPage = 1;
    this.loadPagedResult(query, this.currentPage, this.selectedTheLoaiIds, this.sortBy).subscribe();
  }

  /**Xóa tìm kiếm */
  clearSearch() {
    this.searchControl.setValue('');
    this.currentPage = 1;
    this.loadPage(1);
  }
  onSearchClick() {
  const query = this.searchControl.value?.trim() || '';
  this.currentPage = 1;
  this.loadPagedResult(query, this.currentPage, this.selectedTheLoaiIds).subscribe();
  }

  /*Load sách theo trang */
  loadPage(page: number) {
    const query = this.searchControl.value || '';
    this.loadPagedResult(query, page, this.selectedTheLoaiIds, this.sortBy).subscribe();
  }

  /**Load thể loại */
  loadTheLoais() {
    this.sachService.getTheLoaiWithCounts().subscribe({
      next: (res) => {
        this.theLoais = res;
        this.filteredTheLoais = res;
      },
      error: (err) => {
        console.error('Lỗi tải thể loại:', err);
      }
    });
  }

  /**Lọc thể loại */
  filterTheLoais() {
    const term = this.searchTheLoaiTerm.toLowerCase().trim();
    this.filteredTheLoais = term === ''
      ? this.theLoais
      : this.theLoais.filter(tl => tl.tenTl.toLowerCase().includes(term));
  }

  /**Chọn/bỏ chọn thể loại */
  toggleTheLoai(maTl: string, checked: boolean) {
    if (checked) {
      this.selectedTheLoaiIds.push(maTl);
    } else {
      this.selectedTheLoaiIds = this.selectedTheLoaiIds.filter(id => id !== maTl);
    }
  }

  /**Áp dụng lọc thể loại */
  applyTheLoaiFilter() {
    const query = this.searchControl.value || '';
    this.currentPage = 1;
    this.loadPagedResult(query, this.currentPage, this.selectedTheLoaiIds, this.sortBy).subscribe();
  }

  /*Xóa toàn bộ thể loại */
  clearAllTheLoai() {
    this.selectedTheLoaiIds = [];
    const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    this.filteredTheLoais = this.theLoais;
  }
  selectAllTheLoai() {
    this.selectedTheLoaiIds = this.theLoais.map(tl => tl.maTl);
    const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = true);
  }

  /** Trả về URL hình ảnh */
  getImageUrl(maSach: number, format: string): string {
    return `${this.beBaseUrl}/image/books/${maSach}.${format}`;
  }

  ngAfterViewInit() {
    GLightbox({ selector: '.glightbox' });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  

}
