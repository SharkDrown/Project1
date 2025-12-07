import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js/auto';
import { HttpHeaders } from '@angular/common/http';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,  
    FormsModule    
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


  selectedYear: number = new Date().getFullYear();
  years: number[] = [2022, 2023, 2024, 2025];


  totalReaders = 0;
  totalBooks = 0;
  totalBorrow = 0;
  totalViolation = 0;


  bookGood = 0;
  bookBad = 0;


  chartReaders: any;
  chartBorrowReturn: any;
  chartViolation: any;
  chartBookCondition: any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.reloadDashboard();
  }

  reloadDashboard() {
    this.loadOverview();
    this.loadReadersChart();
    this.loadBorrowReturnChart();
    this.loadViolationChart();
    this.loadBookConditionChart();
  }

  // tổng quan
  loadOverview() {
    this.http
      .get<any>(`/api/account/stats/overview?year=${this.selectedYear}`)
      .subscribe(res => {
        this.totalReaders = res.tongDocGia;
        this.totalBooks = res.tongSach;
        this.totalBorrow = res.tongPhieuMuon;
        this.totalViolation = res.tongViPham;
      });
  }

  // độc giả
  loadReadersChart() {
    this.http
      .get<any[]>(`/api/account/stats/readers-per-month?year=${this.selectedYear}`)
      .subscribe(res => {

        const labels = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
        const values = Array(12).fill(0);

        res.forEach(x => values[x.thang - 1] = x.soLuong);

        if (this.chartReaders) this.chartReaders.destroy();

        this.chartReaders = new Chart('chartReaders', {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Số độc giả',
              data: values,
              backgroundColor: '#4e73df'
            }]
          },
          options: { responsive: true }
        });
      });
  }

  // mượn - trả 
  loadBorrowReturnChart() {
    let borrowData: any[] = [];
    let returnData: any[] = [];

    this.http
      .get<any[]>(`/api/account/stats/borrow?year=${this.selectedYear}`)
      .subscribe(bRes => {
        borrowData = bRes ?? [];

        this.http
          .get<any[]>(`/api/account/stats/return?year=${this.selectedYear}`)
          .subscribe(rRes => {
            returnData = rRes ?? [];

            const labels = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
            const luotMuon = Array(12).fill(0);
            const luotTra = Array(12).fill(0);

            borrowData.forEach(x => luotMuon[x.thang - 1] = x.luotMuon);
            returnData.forEach(x => luotTra[x.thang - 1] = x.luotTra);

            if (this.chartBorrowReturn) this.chartBorrowReturn.destroy();

            this.chartBorrowReturn = new Chart('chartBorrowReturn', {
              type: 'bar',
              data: {
                labels,
                datasets: [
                  { label: 'Lượt mượn', data: luotMuon, backgroundColor: '#4e73df' },
                  { label: 'Lượt trả', data: luotTra, backgroundColor: '#1cc88a' }
                ]
              },
              options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
              }
            });
          });
      });
  }

  // vi phạm
  loadViolationChart() {
    this.http
      .get<any[]>(`/api/account/stats/violations-per-month?year=${this.selectedYear}`)
      .subscribe(res => {

        const labels = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
        const values = Array(12).fill(0);

        res.forEach(x => values[x.thang - 1] = x.viPham);

        if (this.chartViolation) this.chartViolation.destroy();

        this.chartViolation = new Chart('chartViolation', {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Lượt vi phạm',
              data: values,
              backgroundColor: '#e74a3b'
            }]
          },
          options: { responsive: true }
        });
      });
  }

  // tt sách
  loadBookConditionChart() {
    this.http
      .get<any>('/api/account/stats/book-condition')
      .subscribe(res => {

        this.bookGood = res.sachTot;
        this.bookBad = res.sachHong;

        if (this.chartBookCondition) this.chartBookCondition.destroy();

        this.chartBookCondition = new Chart('chartCondition', {
          type: 'bar',
          data: {
            labels: ['Sách tốt', 'Sách hỏng'],
            datasets: [{
              label: 'Số lượng',
              data: [this.bookGood, this.bookBad],
              backgroundColor: ['#4e73df', '#e74a3b']
            }]
          },
          options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
          }
        });
      });
      
  }
  exportExcel(): void {

    const token = localStorage.getItem('access_token');

    if (!token) {
      alert('Bạn chưa đăng nhập hoặc token đã hết hạn!');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url =
      `/api/account/stats/export-excel?year=${this.selectedYear}`;

    this.http.get(url, {
      headers,
      responseType: 'blob'
    }).subscribe({

      next: (blob: Blob) => {
        const fileName = `ThongKeThuVien_${this.selectedYear}.xlsx`;

        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = urlBlob;
        a.download = fileName;
        a.click();

        window.URL.revokeObjectURL(urlBlob);
      },

      error: (err) => {
        console.error('Export Excel failed:', err);
        alert('Xuất file Excel thất bại (401 / 403 / lỗi server)');
      }
    });
  }

}
