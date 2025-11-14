import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SachService } from '../../../services/sach.service';
import { Sach } from '../../../models/sach.model';

@Component({
  selector: 'app-most-borrowed-books',
  imports: [CommonModule, RouterModule],
  templateUrl: './most-borrowed-books.component.html',
  styleUrl: './most-borrowed-books.component.css'
})
export class MostBorrowedBooksComponent implements OnInit {
  books: Sach[] = [];
  loading = false;
  error: string | null = null;
  private beBaseUrl = 'http://localhost:5142';

  constructor(private sachService: SachService) {}

  ngOnInit(): void {
    this.fetchMostBorrowed();
  }

  fetchMostBorrowed(): void {
    this.loading = true;
    this.error = null;
    // Lấy 3 sách mượn nhiều nhất (giả định là 3 sách tiếp theo)
    this.sachService.searchSaches('', 2, 3, []).subscribe({
      next: (res) => {
        this.books = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không tải được sách mượn nhiều';
        this.loading = false;
      }
    });
  }

  getImageUrl(maSach: number, format: string): string {
    return `${this.beBaseUrl}/image/books/${maSach}.${format}`;
  }
}
