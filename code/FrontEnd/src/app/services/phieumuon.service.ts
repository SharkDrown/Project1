import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class PhieuMuonService {
 
   private baseUrl = 'https://localhost:7299/api'; 
  private phieuMuonUrl = `${this.baseUrl}/PhieuMuon`;
  private cuonSachUrl = `${this.baseUrl}/CuonSach`;

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách tất cả các phiếu mượn (dùng cho trang Return/Trả sách)
   */
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.phieuMuonUrl);
  }

  /**
   * Tạo phiếu mượn mới (dùng cho modal Xác nhận Tạo Phiếu bên trang Borrow)
   * @param data { maDg, maNv, ngayTra }
   */
  create(data: any): Observable<any> {
    return this.http.post(this.phieuMuonUrl, data); 
  }

  /**
   * Xóa phiếu mượn
   * @param id Mã phiếu mượn (MaPM)
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.phieuMuonUrl}/${id}`);
  }
  /**
   * Lấy tất cả thông tin cuốn sách bao gồm tình trạng mượn, độc giả, và trạng thái vật lý.
   */
  getAllBookItemsWithStatus(): Observable<any[]> {
    // API: GET /api/CuonSach/trangthai
    return this.http.get<any[]>(`${this.cuonSachUrl}/trangthai`);
  }

  /**
   * Cập nhật trạng thái vật lý của một cuốn sách.
   * @param maVach Mã vạch của cuốn sách.
   * @param newStatus Trạng thái mới ('Tot', 'Hong', 'Mat').
   */
  updateBookItemStatus(maVach: string, newStatus: string): Observable<any> {
    const body = {
      tinhTrang: newStatus // Tên thuộc tính phải khớp với DTO nhận ở Backend
    };
    // API: PUT /api/CuonSach/{maVach}/status
    return this.http.put(`${this.cuonSachUrl}/${maVach}/status`, body);
  }
  
}