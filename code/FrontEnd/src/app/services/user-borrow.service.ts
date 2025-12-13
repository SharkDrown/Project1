import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatTruoc } from '../models/dattruoc.model';
@Injectable({
  providedIn: 'root'
})
export class UserBorrowService {

  private apiUrl = '/api/UserDatTruoc';

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách phiếu đặt của người dùng hiện tại
   */
  getMyBorrows(): Observable<DatTruoc[]> {
    return this.http.get<DatTruoc[]>(`${this.apiUrl}/my`);
  }

  /**
   * Tạo phiếu đặt mới
   * @param maSach Mã sách muốn đặt
   * @param soLuong Số lượng
   */
  createBorrow(maSach: number, soLuong: number): Observable<DatTruoc> {
    return this.http.post<DatTruoc>(this.apiUrl, { maSach, soLuong });
  }

  /**
   * Hủy phiếu đặt
   * @param maDat Mã phiếu đặt
   */
  cancelBorrow(maDat: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${maDat}`);
  }

  /**
   * Cập nhật số lượng phiếu đặt
   * @param maDat Mã phiếu đặt
   * @param soLuong Số lượng mới
   */
  updateQuantity(maDat: number, soLuong: number): Observable<DatTruoc> {
    return this.http.put<DatTruoc>(`${this.apiUrl}/${maDat}/soluong`, soLuong);
  }
}
