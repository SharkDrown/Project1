import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sach } from '../models/sach.model'; 
import { TheLoaiWithCount } from '../models/theloaiwithcount.model';
import { PagedResult } from '../models/pagedresult.model';

@Injectable({
  providedIn: 'root'
})
export class SachService {
  private apiUrl = '/api/quanlythuvien'; 

  constructor(private http: HttpClient) {}

  //  Tìm kiếm sách theo từ khóa + thể loại + phân trang
  searchSaches(
    query: string = '',
    page: number = 1,
    size: number = 9,
    theLoaiIds: string[] = [],
    sortBy: string = 'asc'
  ): Observable<PagedResult<Sach>> {  
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy);
    if (query && query.trim() !== '') {
      params = params.set('query', query.trim());
    }

    if (theLoaiIds && theLoaiIds.length > 0) {
      theLoaiIds.forEach(id => {
        params = params.append('theLoaiIds', id);
      });
    }

    return this.http.get<PagedResult<Sach>>(this.apiUrl, { params });
  }

  // Lấy thông tin 1 sách cụ thể
  getSachById(id: number): Observable<Sach> {
  return this.http.get<Sach>(`${this.apiUrl}/${id}`);
}




  //  Lấy danh sách thể loại + số lượng sách
  getTheLoaiWithCounts(): Observable<TheLoaiWithCount[]> {
    return this.http.get<TheLoaiWithCount[]>(`${this.apiUrl}/theloai/count`);
  }
}
