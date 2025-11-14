import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SachService } from '../../../services/sach.service';
import { Sach } from '../../../models/sach.model';

@Component({
  selector: 'app-recommended-books',
  imports: [CommonModule, RouterModule],
  templateUrl: './recommended-books.component.html',
  styleUrl: './recommended-books.component.css'
})
export class RecommendedBooksComponent implements OnInit {
  books: Sach[] = [];
  loading = false;
  error: string | null = null;
  private beBaseUrl = 'http://localhost:5142';

  constructor(private sachService: SachService) {}

  ngOnInit(): void {
    this.fetchRecommended();
  }

  fetchRecommended(): void {
    this.loading = true;
    this.error = null;
    // Lấy 3 sách đề xuất (giả định là 3 sách tiếp theo)
    this.sachService.searchSaches('', 3, 3, []).subscribe({
      next: (res) => {
        this.books = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không tải được sách đề xuất';
        this.loading = false;
      }
    });
  }

  getImageUrl(maSach: number, format: string): string {
    return `${this.beBaseUrl}/image/books/${maSach}.${format}`;
  }
}
