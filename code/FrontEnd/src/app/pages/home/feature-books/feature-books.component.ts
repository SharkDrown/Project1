import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SachService } from '../../../services/sach.service';
import { Sach } from '../../../models/sach.model';

@Component({
  selector: 'app-feature-books',
  imports: [CommonModule, RouterModule],
  templateUrl: './feature-books.component.html',
  styleUrl: './feature-books.component.css'
})
export class FeatureBooksComponent implements OnInit {
  books: Sach[] = [];
  loading = false;
  error: string | null = null;
  private beBaseUrl = 'http://localhost:5142';

  constructor(private sachService: SachService) {}

  ngOnInit(): void {
    this.fetchFeatured();
  }

  fetchFeatured(): void {
    this.loading = true;
    this.error = null;
    // Lấy 8 sách đầu tiên theo phân trang size=8
    this.sachService.searchSaches('', 1, 8, []).subscribe({
      next: (res) => {
        this.books = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không tải được danh sách sách';
        this.loading = false;
      }
    });
  }

  getImageUrl(maSach: number, format: string): string {
    return `${this.beBaseUrl}/image/books/${maSach}.${format}`;
  }
}
