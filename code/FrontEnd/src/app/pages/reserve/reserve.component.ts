import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reserve',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reserve.component.html',
  styleUrl: './reserve.component.css'
})
export class ReserveComponent implements OnInit {

  pendingList: any[] = [];  // Danh sách sách đặt trước (Trạng thái: Cho)

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPending();
  }

  // API: GET /api/UserDatTruoc/my/pending
  loadPending() {
    this.http.get<any[]>('/api/UserDatTruoc/my/pending').subscribe({
      next: (data) => {
        this.pendingList = data;
        console.log("Dữ liệu đặt trước:", data);
      },
      error: (err) => console.error("Lỗi tải dữ liệu:", err)
    });
  }

  // Cập nhật số lượng
  updateQuantity(item: any) {
  this.http.put(`/api/UserDatTruoc/${item.maDat}/soluong`, item.soLuong)
    .subscribe({
      next: () => {
        alert("Cập nhật thành công!");
        this.loadPending(); // 🔥 gọi API lại ngay để update UI
      },
      error: (err) => {
        alert("Lỗi cập nhật: " + err.error?.message);
      }
    });
}


  // Xóa 1 sản phẩm
  removeItem(maDat: number) {
    if (!confirm("Xóa quyển này khỏi danh sách đặt?")) return;

    this.http.delete(`/api/UserDatTruoc/${maDat}`).subscribe({
      next: () => this.loadPending(),
      error: (err) => alert("Lỗi xóa: " + err.error?.message)
    });
  }

  // Xóa tất cả
  removeAll() {
    if (!confirm("Bạn chắc chắn muốn xóa tất cả?")) return;

    let done = 0;

    this.pendingList.forEach(item => {
      this.http.delete(`/api/UserDatTruoc/${item.maDat}`)
        .subscribe({
          next: () => {
            done++;
            if (done === this.pendingList.length) {
              this.loadPending(); // tất cả xóa xong thì reload
            }
          },
          error: err => console.warn("Lỗi xoá:", err)
        });
    });
  }


  // Tăng / giảm quantity
  increase(item: any) {
    item.soLuong++;
  }

  decrease(item: any) {
    if (item.soLuong > 1) item.soLuong--;
  }
  getImageUrl(maSach?: number, format: string = 'jpg'): string {
    return maSach ? `https:localhost:7299/image/books/${maSach}.${format}` : '/assets/img/no-image.jpg';
  }
  getTenTacGia(item: any): string {
  return item.tacGia?.map((tg: any) => tg.tenTg).join(', ') ?? '';
}
}
