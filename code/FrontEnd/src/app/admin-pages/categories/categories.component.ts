import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BooksService, Category } from '../../services/books.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
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
  get paginatedCategories(): Category[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredCategories.slice(start, end);
  }

  // Modal state
  showModal = false;
  modalTitle = '';
  isEditMode = false;
  currentCategory: Category = {
    maTL: '',
    tenTL: ''
  };

  // Delete confirmation modal
  showDeleteModal = false;
  categoryToDelete: Category | null = null;

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';
    this.booksService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.applySearch();
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải thể loại:', err);
        this.errorMessage = err.error?.message || 'Không thể tải danh sách thể loại.';
        this.loading = false;
      }
    });
  }

  applySearch(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredCategories = [...this.categories];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredCategories = this.categories.filter(cat =>
        cat.maTL?.toLowerCase().includes(term) ||
        cat.tenTL?.toLowerCase().includes(term)
      );
    }
    this.totalItems = this.filteredCategories.length;
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

  // Pagination methods
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
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

  showAddForm(): void {
    this.isEditMode = false;
    this.modalTitle = 'Thêm Thể Loại Mới';
    this.currentCategory = {
      maTL: '',
      tenTL: ''
    };
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  addCategory(): void {
    const ma = this.currentCategory.maTL?.trim();
    const ten = this.currentCategory.tenTL?.trim();

    if (!ma || !ten) {
      this.errorMessage = 'Mã và tên thể loại là bắt buộc.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('📤 Gửi request thêm thể loại:', { maTL: ma, tenTL: ten });

    this.booksService.createCategory({ maTL: ma, tenTL: ten }).subscribe({
      next: (res) => {
        console.log('✅ Thêm thể loại thành công:', res);
        this.successMessage = 'Thêm thể loại thành công!';
        this.loadCategories();
        setTimeout(() => {
          this.closeModal();
          this.successMessage = '';
        }, 1500);
      },
      error: (err) => {
        console.error('❌ Lỗi thêm thể loại:', err);
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
        console.error('Full error:', err);
        
        if (err.status === 409) {
          this.errorMessage = 'Mã thể loại đã tồn tại. Vui lòng chọn mã khác.';
        } else if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Dữ liệu không hợp lệ.';
        } else {
          this.errorMessage = err.error?.message || 'Không thể thêm thể loại. Vui lòng thử lại.';
        }
        this.loading = false;
      }
    });
  }

  showEditForm(category: Category): void {
    this.isEditMode = true;
    this.modalTitle = 'Cập Nhật Thể Loại';
    this.currentCategory = {
      maTL: category.maTL || '',
      tenTL: category.tenTL || ''
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

  saveCategory(): void {
    if (!this.currentCategory.tenTL || this.currentCategory.tenTL.trim() === '') {
      this.errorMessage = 'Vui lòng nhập tên thể loại.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.booksService.updateCategory(this.currentCategory.maTL!, { tenTL: this.currentCategory.tenTL.trim() }).subscribe({
      next: () => {
        this.successMessage = 'Cập nhật thể loại thành công!';
        this.loadCategories();
        setTimeout(() => {
          this.closeModal();
          this.successMessage = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Lỗi cập nhật thể loại:', err);
        this.errorMessage = err.error?.message || 'Không thể cập nhật thể loại. Vui lòng thử lại.';
        this.loading = false;
      }
    });
  }

  showDeleteConfirmation(category: Category): void {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.categoryToDelete = null;
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.booksService.deleteCategory(this.categoryToDelete.maTL!).subscribe({
      next: () => {
        this.successMessage = 'Xóa thể loại thành công!';
        this.loadCategories();
        setTimeout(() => {
          this.closeDeleteModal();
          this.successMessage = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Lỗi xóa thể loại:', err);
        this.errorMessage = err.error?.message || 'Không thể xóa thể loại. Vui lòng thử lại.';
        this.loading = false;
      }
    });
  }
}
