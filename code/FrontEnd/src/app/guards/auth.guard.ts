import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('access_token'); // ✅ đúng key

    if (!token) {
      console.warn('⚠️ Không tìm thấy token, chặn truy cập');
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);
      console.log('🔎 Token giải mã:', decoded);

      // Kiểm tra hạn sử dụng
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.warn('⚠️ Token đã hết hạn');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.router.navigate(['/login']);
        return false;
      }

      // ✅ Token còn hạn → cho phép
      return true;

    } catch (err) {
      console.error('❌ Lỗi khi decode token:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
