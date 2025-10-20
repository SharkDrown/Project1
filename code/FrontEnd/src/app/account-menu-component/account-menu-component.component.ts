import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ thêm dòng này
import { AuthService } from '../services/auth.service'; // ✅ chỉnh path cho đúng

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [RouterModule, CommonModule], // ✅ thêm CommonModule
  templateUrl: './account-menu-component.component.html',
  styleUrls: ['./account-menu-component.component.css']
})
export class AccountMenuComponentComponent {
  dropdownOpen = false;

  constructor(private auth: AuthService, private router: Router) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  // Đóng dropdown khi click ra ngoài
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-dropdown')) {
      this.closeDropdown();
    }
  }

  // ✅ Kiểm tra đăng nhập
  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  // ✅ Đăng xuất
  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.closeDropdown();
  }
}
