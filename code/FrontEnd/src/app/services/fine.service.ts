import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FineTicketDto, FineTicketCreationResponse } from '../models/fineticket.model'; 

export interface PaymentInitResponse {
    paymentUrl: string; // URL VNPAY trả về từ Backend
}

@Injectable({
  providedIn: 'root'
})
export class FineService {
  private apiUrl = '/api/Fine';

  constructor(private http: HttpClient) { }

  createFineTicket(data: FineTicketDto): Observable<FineTicketCreationResponse> {
    return this.http.post<FineTicketCreationResponse>(`${this.apiUrl}/create`, data)
    .pipe(
                
                catchError((error: HttpErrorResponse) => {
                    
                    // Kiểm tra lỗi 409 (Conflict - Đã tạo) hoặc 400 (Bad Request - Không có vi phạm)
                    if (error.status === 409 || error.status === 400) {
                        
                        // Backend trả về lỗi dạng { message: "...", maPm: ... }
                        const errorMessage = error.error && error.error.message 
                                             ? error.error.message 
                                             : 'Lỗi tạo phiếu phạt: Thông tin không hợp lệ.';
                        
                        // Ném thông báo lỗi cụ thể để component bắt được
                        return throwError(() => errorMessage); 
                    }

                    // Xử lý các lỗi HTTP khác (ví dụ: 500, lỗi mạng...)
                    return throwError(() => 'Lỗi kết nối hoặc lỗi máy chủ không xác định.');
                })
            );
  }
  // Khởi tạo thanh toán 
  initiateFinePayment(maPp: number): Observable<PaymentInitResponse> {
      // Endpoint BE: POST /api/Fine/initiate-payment/{maPp}
      // Body request là rỗng ({}).
      return this.http.post<PaymentInitResponse>(`${this.apiUrl}/initiate-payment/${maPp}`, {});
  }
}