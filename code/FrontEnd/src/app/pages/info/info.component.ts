import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InfoMenuComponent } from "./info-menu/info-menu.component";
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, RouterModule, InfoMenuComponent],  
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {
  docGia: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('/api/account/me').subscribe({
      next: (res) => {
        console.log("✅ Dữ liệu độc giả:", res);
        this.docGia = res;
      },
      error: (err) => {
        console.error("❌ Lỗi tải thông tin độc giả:", err);
      }
    });
  }
}

