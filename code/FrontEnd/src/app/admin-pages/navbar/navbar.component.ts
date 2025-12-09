import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  searchText: string = '';
  isAdmin: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.isAdmin = this.authService.getRole() === 'Admin';

    // 🧹 Khi chuyển trang -> tự động xóa tìm kiếm
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (!event.url.includes('/accounts')) {
          
          // Xóa keyword
          localStorage.removeItem('search_keyword');
          this.searchText = '';

          // Báo cho AccountsComponent reset lại danh sách
          window.dispatchEvent(new Event('clearSearch'));
        }
      }
    });
  }

  onSearch() {
    if (!this.isAdmin) return;

    // Chỉ tìm khi đang ở trang accounts
    if (!this.router.url.includes('/accounts')) {
      console.warn("Search only works inside Account page");
      return;
    }

    if (!this.searchText.trim()) return;

    localStorage.setItem('search_keyword', this.searchText.trim());
    window.dispatchEvent(new Event('searchUpdated'));
  }
}
