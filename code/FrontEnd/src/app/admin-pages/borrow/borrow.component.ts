import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowService } from '../../services/borrow.service';
import { DatTruoc } from '../../models/dattruoc.model';
import { CuonSach } from '../../models/cuonsach.model';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-borrow',
  templateUrl: './borrow.component.html',
  styleUrls: ['./borrow.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class BorrowComponent implements OnInit {

  borrows: DatTruoc[] = [];

  showModalSuccess: boolean = false;
  successChon: string[] = [];
  // Modal xóa
  showModalDelete: boolean = false;
  selectedMaDat: number | null = null;

  // Modal duyệt
  showModalDuyet: boolean = false;
  selectedBorrow: DatTruoc | null = null;

  //Modal Hoàn tác
  showModalHoanTac: boolean = false;
  borrowHoanTac: DatTruoc | null = null;
  showModalHoanTacSuccess: boolean = false;


  danhSachCuonSach: CuonSach[] = [];      // danh sách cuốn sách từ API
  daChon: string[] = [];             // danh sách mã vạch đã chọn
  soLuongToiDa: number = 0;          // SoLuong của DatTruoc

  maVachDaBiNguoiKhacDat: string[] = [];
  // Phân trang
  currentPage: number = 1;
  itemsPerPage: number = 10;
  constructor(private borrowService: BorrowService) { }

  ngOnInit(): void {
    this.loadBorrows();
  }

  loadBorrows() {
    this.borrowService.getAllBorrows().subscribe(res => {
      this.borrows = res;
      this.borrows.forEach(b => (b.maVachChon = b.maVachChon ?? []));

      this.currentPage = 1;
    });

  }

  // Mở modal xác nhận xóa
  openDeleteModal(maDat: number) {
    this.selectedMaDat = maDat;
    this.showModalDelete = true;
  }

  // Đóng modal
  closeDeleteModal() {
    this.showModalDelete = false;
    this.selectedMaDat = null;
  }

  // Xác nhận xóa
  confirmDelete() {
    if (!this.selectedMaDat) return;

    this.borrowService.deleteBorrow(this.selectedMaDat).subscribe(() => {
      this.loadBorrows();
      this.closeDeleteModal();
    });
  }
  openDuyetModal(borrow: DatTruoc) {
    this.selectedBorrow = borrow;
    this.soLuongToiDa = borrow.soLuong ?? 0;

    if (!borrow.maSach) return;

    this.borrowService.getCuonSachByMaSach(borrow.maSach).subscribe(res => {
      this.danhSachCuonSach = res;
      // Lấy danh sách mã vạch đã chọn của người này
      this.daChon = [];

      // danh sách mã vạch bị người khác đặt → disable
      //const allOtherBorrows = this.borrows.filter(b => b.maDat !== borrow.maDat);

      this.maVachDaBiNguoiKhacDat = [];
      // Logic phân loại:
      this.danhSachCuonSach.forEach(book => {

        // 1. Sách đã chọn của đơn này (MaDat trùng với đơn hiện tại)
        if (book.maDat === borrow.maDat) {
          this.daChon.push(book.maVach + '');
        }

        // 2. Sách bị đơn khác mượn (Đang mượn VÀ MaDat khác đơn hiện tại)
        if (book.tinhTrang === 'DangMuon' && book.maDat && book.maDat !== borrow.maDat) {
          this.maVachDaBiNguoiKhacDat.push(book.maVach + '');
        }
      });
      // allOtherBorrows.forEach(b => {
      //   if (b.maVachChon?.length) {
      //     this.maVachDaBiNguoiKhacDat.push(...b.maVachChon);
      //   }
      // });
      // xóa mã vạch của chính người này khỏi danh disable
      // this.maVachDaBiNguoiKhacDat = this.maVachDaBiNguoiKhacDat.filter(
      //   mv => !this.daChon.includes(mv)
      // );

      this.showModalDuyet = true;
    });
  }
  closeDuyetModal() {
    this.showModalDuyet = false;
    this.selectedBorrow = null;
    this.danhSachCuonSach = [];
    this.daChon = [];
    this.maVachDaBiNguoiKhacDat = [];
  }
  // Chọn / Bỏ chọn mã vạch
  toggleChon(maVach: string, tinhTrang: string, bookMaDat?: number) {
    if (!this.selectedBorrow) return;
    if (this.maVachDaBiNguoiKhacDat.includes(maVach)) return;
    // 2. Nếu sách đang mượn VÀ MaDat KHÁC đơn hiện tại → cấm
    // (Phòng trường hợp lỗi dữ liệu, mặc dù đã check ở trên)
    if (tinhTrang === 'DangMuon' && bookMaDat !== this.selectedBorrow.maDat) return;

    const idx = this.daChon.indexOf(maVach);

    if (idx >= 0) {
      this.daChon.splice(idx, 1); // bỏ chọn
    } else {

      // Không vượt quá số lượng người dùng cần
      // if (this.daChon.length >= this.soLuongToiDa) {
      //   alert(`Bạn chỉ được chọn tối đa ${this.soLuongToiDa} cuốn.`);
      //   return;
      // }

      this.daChon.push(maVach);
    }

    // const isDangMuon = tinhTrang === 'DangMuon';
    // if (isDangMuon && !this.daChon.includes(maVach)) return;

    // const idx = this.daChon.indexOf(maVach);

    // if (idx >= 0) {
    //   this.daChon.splice(idx, 1);
    // } else {


    //   if (this.daChon.length >= this.soLuongToiDa) {
    //     alert(`Bạn chỉ được chọn tối đa ${this.soLuongToiDa} cuốn.`);
    //     return;
    //   }

    //   this.daChon.push(maVach);
    // }
  }

  // Nhấn nút OK trong modal duyệt
  confirmDuyet() {
    if (!this.selectedBorrow) return;

   if (this.daChon.length === 0) {
      alert('Vui lòng chọn sách');
      return;
  }
    const maDat = this.selectedBorrow.maDat!;
    // 1. Lưu các mã vạch đã chọn để hiển thị ở modal success
    this.successChon = [...this.daChon];
    // 2. Cập nhật trạng thái đơn lên 'DaNhan'
    this.borrowService.updateStatus(maDat, 'DaNhan').subscribe({
      next: () => {

        // 3. Tạo mảng Observable cho tất cả cuốn sách cần cập nhật
        const updates: any[] = [];

        // Cuốn được chọn -> DangMuon
        this.daChon.forEach(maVach => {
          updates.push(this.borrowService.updateTinhTrang(maVach, 'DangMuon', maDat));
        });
        // B. Cập nhật SÁCH BỊ BỎ CHỌN (Gán TinhTrang: Tot & MaDat: null)
        // Lọc ra các cuốn đang mượn của đơn này nhưng bị bỏ chọn
        const maVachDaMuonCuaDonNay = this.danhSachCuonSach
          .filter(c => c.maDat === maDat) // Lọc những cuốn đang thuộc về đơn này
          .map(c => c.maVach + '');
        // Cuốn bỏ chọn -> Tot
        const listBoChon = maVachDaMuonCuaDonNay.filter(mv => !this.daChon.includes(mv));
        listBoChon.forEach(maVach => {
        // Gán maDat là null để giải phóng quyền sở hữu
        updates.push(this.borrowService.updateTinhTrang(maVach, 'Tot', null));
      });

        // 4. Chạy forkJoin cho tất cả
        forkJoin(updates).subscribe({
          next: () => {
            // Cập nhật mảng mã vạch của borrow
            this.selectedBorrow!.maVachChon = [...this.daChon];
            this.showModalDuyet = false;
            this.showModalSuccess = true;
            // Dữ liệu sẽ load lại khi nhấn OK ở modal success
          },
          error: err => {
            console.error('Lỗi khi cập nhật trạng thái sách:', err);
            alert('Cập nhật trạng thái sách gặp lỗi!');
          }
        });
      },
      error: err => console.error('Lỗi khi cập nhật trạng thái đơn:', err)
    });
  }



  okSuccess() {
    // Sau khi nhấn OK, reset dữ liệu và tải lại danh sách
    this.loadBorrows();
    this.showModalSuccess = false;
    // this.selectedBorrow = null;
    // this.daChon = [];
    // this.danhSachCuonSach = [];
    // this.successChon = [];
  }
  openHoanTacModal(borrow: DatTruoc) {
    this.borrowHoanTac = borrow;
    this.showModalHoanTac = true;
  }

  closeHoanTacModal() {
    this.showModalHoanTac = false;
    this.borrowHoanTac = null;
  }
  confirmHoanTac() {
    if (!this.borrowHoanTac) return;

    const borrow = this.borrowHoanTac;
    // const maDat = borrow.maDat!;
    // const maSach = borrow.maSach!;

    // 1. Lấy danh sách cuốn sách của mã sách
    this.borrowService.getCuonSachByMaSach(borrow.maSach!).subscribe({
      next: (listCuon) => {
        // Tìm cuốn đang mượn
        const listDangMuon = listCuon.filter(c => c.maDat === borrow.maDat);

        // if (listDangMuon.length === 0) {
        //   alert("Không có cuốn sách nào đang ở trạng thái 'Đang mượn'");
        //   return;
        // }

        // 2. Chuẩn bị danh sách các lệnh cập nhật sách -> 'Tot'
        const arrUpdates = listDangMuon.map(c =>
          this.borrowService.updateTinhTrang(String(c.maVach), "Tot",null)
        );

        // 3. Cập nhật toàn bộ sách
        forkJoin(arrUpdates).subscribe({
          next: () => {
            // 4. Cập nhật trạng thái yêu cầu mượn -> 'Cho'
            this.borrowService.updateStatus(borrow.maDat!, "Cho").subscribe({
              next: () => {
                // 5. Hoàn tất
                this.showModalHoanTac = false;
                this.showModalHoanTacSuccess = true;
                this.loadBorrows();


              }

            });
          }

        });
      }

    });
  }
  // Tổng số trang
  get totalPages(): number {
    return Math.ceil(this.borrows.length / this.itemsPerPage);
  }

  // Dữ liệu theo từng trang
  get paginatedBorrows(): DatTruoc[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.borrows.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Chuyển trang
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

}
