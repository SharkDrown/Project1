import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notice {
  maTb: number;
  noiDung?: string;
  ngayTb?: string;
  maTk?: number;
}

export interface CreateNoticeDto {
  noiDung: string;
  maTk?: number;
}

export interface Account {
  maTk: number;
  tenDangNhap?: string;
  hoTen?: string;
  vaiTro?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  private apiUrl = '/api/notices';

  constructor(private http: HttpClient) { }

  // Lấy thông báo của tài khoản hiện tại
  getMyNotices(): Observable<Notice[]> {
    return this.http.get<Notice[]>(`${this.apiUrl}/my`);
  }

  // Lấy tất cả thông báo (admin)
  getAllNotices(): Observable<Notice[]> {
    return this.http.get<Notice[]>(this.apiUrl);
  }

  // Tạo thông báo mới
  createNotice(notice: CreateNoticeDto): Observable<Notice> {
    return this.http.post<Notice>(this.apiUrl, notice);
  }

  // Xóa thông báo
  deleteNotice(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Lấy danh sách tài khoản theo vai trò
  getAccountsByRole(role: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/accounts/${role}`);
  }

  // Gửi thông báo cho nhiều tài khoản
  sendToMultiple(notices: CreateNoticeDto[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/multiple`, notices);
  }
}

