import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BooksService, Book, Category, CreateBookDto, UpdateBookDto } from '../../services/books.service';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './books.component.html',
  styleUrl: './books.component.css'
})
export class BooksComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  categories: Category[] = [];
  loading = false;
  errorMessage: string = '';
  successMessage: string = '';
  Math = Math; // Expose Math để dùng trong template

  // Search
  searchTerm: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
  get paginatedBooks(): Book[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredBooks.slice(start, end);
  }

  // Modal state
  showModal = false;
  modalTitle = '';
  isEditMode = false;
  currentBook: UpdateBookDto = {
    maSach: 0,
    tuaSach: '',
    namXB: undefined,
    nhaXB: '',
    soLuong: 0,
    maTL: ''
  };

  // Delete confirmation modal
  showDeleteModal = false;
  bookToDelete: Book | null = null;

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    this.loadBooks();
    this.loadCategories();
  }

  loadBooks(): void {
    this.loading = true;
    this.errorMessage = '';
    this.booksService.getBooks().subscribe({
      next: (data) => {
        this.books = data;
        this.applySearch();
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải danh sách sách:', err);
        this.errorMessage = 'Không thể tải danh sách sách. Vui lòng thử lại.';
        this.loading = false;
      }
    });
  }

  applySearch(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredBooks = [...this.books];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredBooks = this.books.filter(book => 
        book.maSach.toString().includes(term) ||
        book.tuaSach.toLowerCase().includes(term) ||
        (book.namXB && book.namXB.toString().includes(term)) ||
        (book.nhaXB && book.nhaXB.toLowerCase().includes(term)) ||
        (book.tenTL && book.tenTL.toLowerCase().includes(term)) ||
        this.getCategoryName(book.maTL).toLowerCase().includes(term)
      );
    }
    this.totalItems = this.filteredBooks.length;
    // Reset về trang 1 nếu trang hiện tại không còn hợp lệ
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }
  }

  onSearchChange(): void {
    this.applySearch();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applySearch();
  }

  loadCategories(): void {
    this.booksService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Lỗi tải danh sách thể loại:', err);
      }
    });
  }

  showAddForm(): void {
    this.isEditMode = false;
    this.modalTitle = 'Thêm Sách Mới';
    this.currentBook = {
      maSach: 0,
      tuaSach: '',
      namXB: undefined,
      nhaXB: '',
      soLuong: 0,
      maTL: ''
    };
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  showEditForm(book: Book): void {
    this.isEditMode = true;
    this.modalTitle = 'Cập Nhật Sách';
    this.currentBook = {
      maSach: book.maSach,
      tuaSach: book.tuaSach,
      namXB: book.namXB,
      nhaXB: book.nhaXB || '',
      soLuong: book.soLuong,
      maTL: book.maTL || ''
    };
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveBook(): void {
    if (!this.currentBook.tuaSach || this.currentBook.tuaSach.trim() === '') {
      this.errorMessage = 'Vui lòng nhập tên sách.';
      return;
    }

    if (this.currentBook.soLuong < 0) {
      this.errorMessage = 'Số lượng không được âm.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isEditMode) {
      // Cập nhật sách
      this.booksService.updateBook(this.currentBook.maSach, this.currentBook).subscribe({
        next: () => {
          this.successMessage = 'Cập nhật sách thành công!';
          this.loadBooks();
          setTimeout(() => {
            this.closeModal();
            this.successMessage = '';
          }, 1500);
        },
        error: (err) => {
          console.error('Lỗi cập nhật sách:', err);
          this.errorMessage = err.error?.message || 'Không thể cập nhật sách. Vui lòng thử lại.';
          this.loading = false;
        }
      });
    } else {
      // Thêm sách mới
      const createDto: CreateBookDto = {
        tuaSach: this.currentBook.tuaSach,
        namXB: this.currentBook.namXB,
        nhaXB: this.currentBook.nhaXB || undefined,
        soLuong: this.currentBook.soLuong,
        maTL: this.currentBook.maTL || undefined
      };

      this.booksService.createBook(createDto).subscribe({
        next: () => {
          this.successMessage = 'Thêm sách thành công!';
          this.loadBooks();
          setTimeout(() => {
            this.closeModal();
            this.successMessage = '';
          }, 1500);
        },
        error: (err) => {
          console.error('Lỗi thêm sách:', err);
          this.errorMessage = err.error?.message || 'Không thể thêm sách. Vui lòng thử lại.';
          this.loading = false;
        }
      });
    }
  }

  showDeleteConfirmation(book: Book): void {
    this.bookToDelete = book;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.bookToDelete = null;
  }

  confirmDelete(): void {
    if (!this.bookToDelete) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.booksService.deleteBook(this.bookToDelete.maSach).subscribe({
      next: () => {
        this.successMessage = 'Xóa sách thành công!';
        this.closeDeleteModal();
        this.loadBooks();
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
      },
      error: (err) => {
        console.error('Lỗi xóa sách:', err);
        this.errorMessage = err.error?.message || 'Không thể xóa sách. Có thể sách đang được sử dụng trong hệ thống.';
        this.loading = false;
        this.closeDeleteModal();
      }
    });
  }

  getCategoryName(maTL?: string): string {
    if (!maTL) return 'Chưa phân loại';
    const category = this.categories.find(c => c.maTL === maTL);
    return category ? category.tenTL : 'Chưa phân loại';
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Scroll to top of table
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

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5; // Hiển thị tối đa 5 số trang
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);
    
    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
