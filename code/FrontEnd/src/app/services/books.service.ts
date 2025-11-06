import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Book {
  maSach: number;
  tuaSach: string;
  namXB?: number;
  nhaXB?: string;
  soLuong: number;
  maTL?: string;
  tenTL?: string;
}

export interface Category {
  maTL: string;
  tenTL: string;
}

export interface CreateBookDto {
  tuaSach: string;
  namXB?: number;
  nhaXB?: string;
  soLuong: number;
  maTL?: string;
}

export interface UpdateBookDto {
  maSach: number;
  tuaSach: string;
  namXB?: number;
  nhaXB?: string;
  soLuong: number;
  maTL?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private apiUrl = '/api/books';
  private categoriesUrl = '/api/categories';

  constructor(private http: HttpClient) {}

  // Lấy danh sách tất cả sách
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  // Lấy thông tin một sách theo ID
  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  // Thêm sách mới
  createBook(book: CreateBookDto): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book);
  }

  // Cập nhật sách
  updateBook(id: number, book: UpdateBookDto): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, book);
  }

  // Xóa sách
  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Lấy danh sách thể loại
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }
}

