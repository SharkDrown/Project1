import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-info-menu',
  standalone: true,
  // ⚠️ Quan trọng: thêm RouterModule (vì template dùng routerLink)
  imports: [CommonModule, RouterModule],
  templateUrl: './info-menu.component.html',
  styleUrls: ['./info-menu.component.css']
})
export class InfoMenuComponent {
  constructor(private router: Router) {}

  onLogout() {
    // Xoá token ở trình duyệt hiện tại
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // (tuỳ chọn) xoá thêm flag đăng nhập nếu bạn có dùng
    localStorage.removeItem('isLoggedIn');

    // Điều hướng về trang đăng nhập
    this.router.navigate(['/login']);
  }
}
