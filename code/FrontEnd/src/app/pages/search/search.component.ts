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

  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private beBaseUrl = 'https://localhost:7299';

  constructor(private sachService: SachService) {}

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
  private loadPagedResult(query: string, page: number, theLoaiIds: string[] = []): Observable<PagedResult<Sach>> {
    this.loading = true;
    this.error = null;

    return this.sachService.searchSaches(query, page, this.pageSize, theLoaiIds).pipe(
      switchMap((pagedResult: PagedResult<Sach>) => {
        this.pagedSaches = pagedResult.data;
        this.totalCount = pagedResult.totalCount;
        this.totalPages = pagedResult.totalPages;
        this.currentPage = page;
        this.loading = false;
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

  
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      const query = this.searchControl.value || '';
      this.loadPagedResult(query, page, this.selectedTheLoaiIds).subscribe();
    }
  }

  /** "Tìm kiếm" */
  onSearch() {
    const query = this.searchControl.value?.trim() || '';
    this.currentPage = 1;
    this.loadPagedResult(query, this.currentPage, this.selectedTheLoaiIds).subscribe();
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
    this.loadPagedResult(query, page, this.selectedTheLoaiIds).subscribe();
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
    this.loadPagedResult(query, this.currentPage, this.selectedTheLoaiIds).subscribe();
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
