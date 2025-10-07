import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  tenDangNhap: string;
  matKhau: string;
}

export interface RegisterRequest {
  tenDangNhap: string;
  email: string;
  matKhau: string;
  xacNhanMatKhau: string;
  hoTen: string;
  ngaySinh?: Date;
  diaChi?: string;
  soDT?: string;
}

export interface DocGiaInfo {
  maDG: number;
  hoTen: string;
  ngaySinh?: Date;
  diaChi?: string;
  email?: string;
  soDT?: string;
}

export interface NhanVienInfo {
  maNV: number;
  hoTen: string;
  chucVu?: string;
  email?: string;
  soDT?: string;
}

export interface UserInfo {
  maTK: number;
  tenDangNhap: string;
  vaiTro: string;
  trangThai: boolean;
  docGia?: DocGiaInfo;
  nhanVien?: NhanVienInfo;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:5024/api/auth';
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          this.setUserData(response);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          this.setUserData(response);
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {})
      .pipe(
        tap(() => {
          this.clearUserData();
          this.router.navigate(['/login']);
        })
      );
  }

  checkUsername(username: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.API_URL}/check-username/${username}`);
  }

  checkEmail(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.API_URL}/check-email/${email}`);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.API_URL}/profile`);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.vaiTro === 'Admin';
  }

  isNhanVien(): boolean {
    const user = this.getCurrentUser();
    return user?.vaiTro === 'NhanVien';
  }

  isDocGia(): boolean {
    const user = this.getCurrentUser();
    return user?.vaiTro === 'DocGia';
  }

  private setUserData(response: AuthResponse): void {
    try {
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
      console.log('User data saved successfully:', response.user);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  private clearUserData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr && this.isAuthenticated()) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch {
        this.clearUserData();
      }
    } else {
      this.clearUserData();
    }
  }
}
