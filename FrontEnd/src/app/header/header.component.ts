import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountMenuComponentComponent } from "../account-menu-component/account-menu-component.component"
import { FindComponent } from "../find/find.component";
import { NavMenuComponent } from "../nav-menu/nav-menu.component";
import { RouterModule } from '@angular/router';
import { AuthService, UserInfo } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, AccountMenuComponentComponent, FindComponent, NavMenuComponent, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser: UserInfo | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
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
}
