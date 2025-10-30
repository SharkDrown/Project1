import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface DanhGia {
  maDg?: number;
  maSach: number;
  hoTen: string;
  soSao: number;
  binhLuan: string;
  ngayDg: string;
}
@Injectable({
  providedIn: 'root'
})

export class DanhGiaSachService {
  private apiUrl = 'https://localhost:7299/api/QuanLyThuVien'; 

  constructor(private http: HttpClient) {}

  // Lấy danh sách đánh giá theo mã sách
  getDanhGiaTheoSach(maSach: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/danhgia/${maSach}`);
  }
 
  themDanhGia(danhGia: any) {
  const headers = { 'Content-Type': 'application/json' };
  return this.http.post(`${this.apiUrl}/danhgia`, danhGia, { headers });
}
   /** Xóa đánh giá */
  deleteDanhGia(maSach: number, maDg: number) {
     const token = localStorage.getItem('access_token');

     let headers = new HttpHeaders();
     if (token) {
       headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return this.http.delete(`${this.apiUrl}/danhgia/${maSach}/${maDg}`, { headers });
  }

}
