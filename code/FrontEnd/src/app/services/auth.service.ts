import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  // ===== Đăng ký tài khoản =====
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // ===== Đăng nhập =====
  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        if (res && res.access_token) {
          this.setTokens(res.access_token, res.refresh_token);
        }
      })
    );
  }

  // ===== Làm mới access token =====
  refreshToken(): Observable<any> {
    const refresh = this.getRefreshToken();
    return this.http.post<any>(`${this.apiUrl}/refresh`, refresh).pipe(
      tap(res => {
        if (res && res.access_token) {
          localStorage.setItem('access_token', res.access_token);
        }
      })
    );
  }

  // ===== Helper methods =====
  private setTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // ===== Đăng xuất (xoá token ở trình duyệt hiện tại) =====
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user'); // nếu bạn có lưu thông tin user
  }

  // ===== Kiểm tra trạng thái đăng nhập =====
  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }
}



//'https://localhost:7288/api/Auth'

// http://localhost:5142/api/auth/register