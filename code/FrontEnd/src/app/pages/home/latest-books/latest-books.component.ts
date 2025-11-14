import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SachService } from '../../../services/sach.service';
import { Sach } from '../../../models/sach.model';

@Component({
  selector: 'app-latest-books',
  imports: [CommonModule, RouterModule],
  templateUrl: './latest-books.component.html',
  styleUrl: './latest-books.component.css'
})
export class LatestBooksComponent implements OnInit {
  books: Sach[] = [];
  loading = false;
  error: string | null = null;
  private beBaseUrl = 'http://localhost:5142';

  constructor(private sachService: SachService) {}

  ngOnInit(): void {
    this.fetchLatest();
  }

  fetchLatest(): void {
    this.loading = true;
    this.error = null;
    // Lấy 3 sách mới nhất (giả định là 3 sách đầu tiên)
    this.sachService.searchSaches('', 1, 3, []).subscribe({
      next: (res) => {
        this.books = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không tải được sách mới';
        this.loading = false;
      }
    });
  }

  getImageUrl(maSach: number, format: string): string {
    return `${this.beBaseUrl}/image/books/${maSach}.${format}`;
  }
}
