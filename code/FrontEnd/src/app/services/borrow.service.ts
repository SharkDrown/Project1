import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatTruoc } from '../models/dattruoc.model';
import { CuonSach } from '../models/cuonsach.model';
import { HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class BorrowService {
  private apiUrl = '/api/DatTruoc';
  private cuonSachUrl = '/api/CuonSach';
  constructor(private http: HttpClient) { }

  getAllBorrows(): Observable<DatTruoc[]> {
    return this.http.get<DatTruoc[]>(`${this.apiUrl}/admin`);
  }

  createBorrow(borrow: Partial<DatTruoc>): Observable<DatTruoc> {
    return this.http.post<DatTruoc>(`${this.apiUrl}/admin`, borrow);
  }



  updateStatus(maDat: number, trangThai: string): Observable<DatTruoc> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    // Gửi chuỗi trực tiếp với dấu ngoặc kép, ví dụ: "\"DaNhan\""
    return this.http.put<DatTruoc>(`${this.apiUrl}/admin/${maDat}/status`, JSON.stringify(trangThai), { headers });
  }

  deleteBorrow(maDat: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${maDat}`);
  }
  getCuonSachByMaSach(maSach: number | string): Observable<CuonSach[]> {
    return this.http.get<CuonSach[]>(`${this.cuonSachUrl}/by-masach/${maSach}`);
  }

  updateTinhTrang(maVach: string, tinhTrang: string, maDat: number | null): Observable<void> {
    
    return this.http.put<void>(`${this.cuonSachUrl}/${maVach}/status`, { tinhTrang, maDat });
  }
  
  assignReservationToItem(maVach: string, maDat: number): Observable<any> {
    const url = `${this.cuonSachUrl}/${maVach}/assign-reservation`;
    
    const body = { MaDat: maDat, TinhTrang: "DatTruoc" }; 

    return this.http.put(url, body);
  }


}
