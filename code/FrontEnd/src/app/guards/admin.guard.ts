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
      console.log('Không có token, chuyển đến trang đăng nhập');
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);
      console.log("Decoded token:", decoded);

      // Lấy role từ token
      const role = decoded.role 
                || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      // Kiểm tra hết hạn
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.log('Token đã hết hạn, chuyển đến trang đăng nhập');
        localStorage.removeItem('access_token');
        this.router.navigate(['/login']);
        return false;
      }

      // Chỉ cho Admin và NhanVien vào
      if (role === 'Admin' || role === 'NhanVien') {
        return true;
      } else {
        console.log('Không có quyền admin, chuyển đến trang chủ');
        this.router.navigate(['/']);
        return false;
      }
    } catch (err) {
      console.error('Lỗi decode token:', err);
      localStorage.removeItem('access_token');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
