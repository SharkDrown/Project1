import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);
      console.log("🔎 Decoded token:", decoded);

      // Lấy role từ token
      const role = decoded.role 
                || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      // Kiểm tra hết hạn
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.clear();
        this.router.navigate(['/login']);
        return false;
      }

      // ✅ Chỉ cho Admin vào
      if (role === 'Admin' || role ==='NhanVien') {
        return true;
      } else {
        console.warn('⚠️ Bạn không có quyền Admin');
        this.router.navigate(['/']);
        return false;
      }
    } catch (err) {
      localStorage.clear();
      this.router.navigate(['/login']);
      return false;
    }
  }
}
