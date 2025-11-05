import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Nếu đã đăng nhập thì không cho vào login nữa
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
