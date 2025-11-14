import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);

      // ⏰ Kiểm tra token hết hạn
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.clear();
        this.router.navigate(['/login']);
        return false;
      }

      const role = decoded.role 
          || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        if (role === 'DocGia') {
        return true;
        }
        if (role === 'Admin') {
        this.router.navigate(['/admin']);
        return false;
        }


      // Trường hợp role không hợp lệ
      this.router.navigate(['/login']);
      return false;

    } catch (err) {
      console.error('❌ Lỗi decode token:', err);
      localStorage.clear();
      this.router.navigate(['/login']);
      return false;
    }
  }
}
