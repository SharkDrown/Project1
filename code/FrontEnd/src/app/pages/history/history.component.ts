import { Component, OnInit } from '@angular/core';
import { PhieuMuon } from '../../models/phieumuon.model';
import { RouterModule } from '@angular/router';
import { PhieuMuonService } from '../../services/phieumuon.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  orders: PhieuMuon[] = [];

  pageSize = 3;
  currentPage = 1;
  totalPages = 0;

  constructor(private phieuMuonService: PhieuMuonService) {}

  ngOnInit(): void {
    this.loadData(); // ✅ chỉ gọi 1 chỗ
  }

  loadData() {
    this.phieuMuonService
      .getMyPhieuMuons(this.currentPage, this.pageSize)
      .subscribe(res => {
        this.orders = res.data;        // ✅ array
        this.totalPages = res.totalPages;
      });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadData();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getTotalQuantity(items: any[]): number {
    return items.reduce((sum, item) => sum + item.soLuong, 0);
  }

  getImageUrl(maSach?: number, format: string = 'jpg'): string {
    return maSach
      ? `https://localhost:7299/image/books/${maSach}.${format}`
      : '/assets/img/no-image.jpg';
  }
}
