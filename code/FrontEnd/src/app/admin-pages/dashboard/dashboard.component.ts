import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  totalReaders: number = 0;
  totalBorrow: number = 0;
  totalViolation: number = 0;
  bookGood: number = 0;
  bookBad: number = 0;

  chartReaders: any;
  chartBorrowReturn: any;
  chartViolation: any;
  chartBookCondition: any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadOverview();
    this.loadReadersChart();
    this.loadBorrowReturnChart();    
    this.loadViolationChart();
    this.loadBookConditionChart();
  }
  ngAfterViewInit(): void {
    this.loadBorrowReturnChart();
  }

  // tổng quan
  loadOverview() {
    this.http.get<any>('/api/account/stats/overview').subscribe(res => {
      this.totalReaders = res.totalReaders;
      this.totalBorrow = res.totalBorrow;
      this.totalViolation = res.totalViolation;
      this.bookGood = res.bookGood;
      this.bookBad = res.bookBad;
    });
  }

  // biểu đồ độc giả
  loadReadersChart() {
    this.http.get<any[]>('/api/account/stats/readers-per-month').subscribe(res => {

      const labels = res.map(x => `Tháng ${x.thang}`);
      const values = res.map(x => x.soLuong);

      // destroy chart cũ
      if (this.chartReaders) this.chartReaders.destroy();

      this.chartReaders = new Chart('chartReaders', {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: "Số độc giả",
            data: values,
            backgroundColor: '#4e73df'
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    });
  }

  // biểu đồ mượn - trả
  loadBorrowReturnChart() {

    let borrowData: any[] = [];
    let returnData: any[] = [];

    this.http.get<any[]>('/api/account/stats/borrow').subscribe(bRes => {
      borrowData = bRes ?? [];

      this.http.get<any[]>('/api/account/stats/return').subscribe(rRes => {
        returnData = rRes ?? [];

        const labels = borrowData.map(x => "Tháng " + x.thang);

        const luotMuon = borrowData.map(x => x.luotMuon);

        const luotTra = borrowData.map(b => {
          const match = returnData.find(r => r.thang === b.thang);
          return match ? match.luotTra : 0;
        });

        // HỦY BIỂU ĐỒ CŨ
        if (this.chartBorrowReturn) {
          this.chartBorrowReturn.destroy();
        }

        // VẼ BIỂU ĐỒ
        this.chartBorrowReturn = new Chart('chartBorrowReturn', {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: "Lượt mượn",
                data: luotMuon,
                backgroundColor: '#4e73df'
              },
              {
                label: "Lượt trả",
                data: luotTra,
                backgroundColor: '#1cc88a'
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true }
            }
          }
        });

      });
    });
  }



  // biểu đồ vi phạm 
  loadViolationChart() {
    this.http.get<any[]>('/api/account/stats/violations-per-month').subscribe(res => {

      const labels = res.map(x => `Tháng ${x.thang}`);
      const values = res.map(x => x.viPham);

      if (this.chartViolation) this.chartViolation.destroy();

      this.chartViolation = new Chart('chartViolation', {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: "Lượt vi phạm",
            data: values,
            backgroundColor: '#e74a3b'
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    });
  }

  // biểu đồ tình trạng sách
loadBookConditionChart() {
  this.http.get<any>('/api/account/stats/book-condition').subscribe(res => {

    const sachTot = res.sachTot ?? 0;
    const sachHong = res.sachHong ?? 0;

    if (this.chartBookCondition) {
      this.chartBookCondition.destroy();
    }

    this.chartBookCondition = new Chart('chartCondition', {
      type: 'bar',
      data: {
        labels: ['Sách tốt', 'Sách hỏng'],
        datasets: [{
          label: "Số lượng",
          data: [sachTot, sachHong],
          backgroundColor: ['#4e73df', '#e74a3b'],
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  });
}


}

