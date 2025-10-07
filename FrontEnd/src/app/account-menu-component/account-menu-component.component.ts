import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserInfo } from '../services/auth.service';

@Component({
  selector: 'account-menu-component',
  imports: [CommonModule, RouterModule],
  templateUrl: './account-menu-component.component.html',
  styleUrl: './account-menu-component.component.css'
})
export class AccountMenuComponentComponent implements OnInit {
  currentUser: UserInfo | null = null;
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.isMenuOpen = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        this.isMenuOpen = false;
        this.router.navigate(['/']);
      }
    });
  }

  getDisplayName(): string {
    if (this.currentUser?.docGia?.hoTen) {
      return this.currentUser.docGia.hoTen;
    }
    if (this.currentUser?.nhanVien?.hoTen) {
      return this.currentUser.nhanVien.hoTen;
    }
    return this.currentUser?.tenDangNhap || 'User';
  }

  getRoleDisplayName(): string {
    switch (this.currentUser?.vaiTro) {
      case 'Admin':
        return 'Quản trị viên';
      case 'NhanVien':
        return 'Nhân viên';
      case 'DocGia':
        return 'Độc giả';
      default:
        return 'Người dùng';
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
}
