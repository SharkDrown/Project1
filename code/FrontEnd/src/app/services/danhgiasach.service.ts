import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface DanhGia {
  maDg: number;
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
    const url = `${this.apiUrl}/danhgia`;
    return this.http.post(url, danhGia, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
   /** Xóa đánh giá */
  deleteDanhGia(maDg: number, maSach: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/danhgia/${maSach}/${maDg}`);
  }

}
