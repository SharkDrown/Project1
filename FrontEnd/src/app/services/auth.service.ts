import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 👉 export để nơi khác dùng cùng 1 kiểu
export interface RegisterPayload {
  TenDangNhap: string;
  MatKhau: string;
  VaiTro?: 'DocGia' | 'NhanVien' | 'Admin';
}

export interface LoginPayload {
  TenDangNhap: string;
  MatKhau: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // ⚠️ Sửa port cho đúng với backend khi bạn chạy (http/https)
  private readonly api = 'http://localhost:5024/api/auth';

  constructor(private http: HttpClient) {}

  register(body: RegisterPayload): Observable<any> {
    // ❗ PHẢI có return, nếu không component sẽ không .subscribe được
    return this.http.post(`${this.api}/register`, body);
  }

  login(body: LoginPayload): Observable<any> {
    return this.http.post(`${this.api}/login`, body);
  }
}


