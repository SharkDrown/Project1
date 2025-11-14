import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Lấy token từ localStorage (đã được AuthService lưu)
    const token = localStorage.getItem('access_token');

    if (token) {
      // ✅ Gắn token vào header Authorization
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }

    // Nếu chưa có token, gửi request bình thường
    return next.handle(req);
  }
}
