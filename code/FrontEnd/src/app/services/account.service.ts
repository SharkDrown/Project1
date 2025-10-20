import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = '/api/account';

  constructor(private http: HttpClient) {}

  // Lấy thông tin tài khoản (độc giả + TenDangNhap)
  getMyAccount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  // Cập nhật thông tin
  updateAccount(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, data);
  }

  // Vô hiệu hóa tài khoản
  deactivateAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deactivate`);
  }
}
