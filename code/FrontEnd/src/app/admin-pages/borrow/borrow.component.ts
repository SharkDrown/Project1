import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowService } from '../../services/borrow.service';
import { DatTruoc } from '../../models/dattruoc.model';
import { CuonSach } from '../../models/cuonsach.model';
import { forkJoin, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SachService } from '../../services/sach.service';
import { PhieuMuonService } from '../../services/phieumuon.service';
import { PhieuMuonSharedService } from '../../services/phieumuonshared.service';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-borrow',
  templateUrl: './borrow.component.html',
  styleUrls: ['./borrow.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BorrowComponent implements OnInit {
  // Biến tìm kiếm sẽ gắn với input
  searchTerm: string = '';
  borrows: DatTruoc[] = [];
  // Mảng đã lọc (sử dụng để hiển thị trên bảng)
  filteredBorrows: DatTruoc[] = [];
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
  // --- BIẾN CHO MODAL TẠO PHIẾU ---
  showModalCreateLoan: boolean = false;
  inputMaDg: number | null = null;
  loanItems: any[] = []; // Chứa danh sách sách hiển thị bên phải
  selectedNgayTra: string | null = null;
  checkMessage: string = '';
  checkMessageType: string = '';
  // Modal tạo phiếu thành công
  showModalSuccessCreate: boolean = false; 
  latestMaPM: number | null = null;
  successMessage: string = '';

  danhSachCuonSach: CuonSach[] = [];      // danh sách cuốn sách từ API
  daChon: string[] = [];             // danh sách mã vạch đã chọn
  soLuongToiDa: number = 0;          // SoLuong của DatTruoc

  maVachDaBiNguoiKhacDat: string[] = [];
  // Phân trang
  currentPage: number = 1;
  itemsPerPage: number = 10;
  constructor(private borrowService: BorrowService,
    private sachService: SachService,
    private phieuMuonService: PhieuMuonService,
    private phieuMuonSharedService: PhieuMuonSharedService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.loadBorrows();
  }

  loadBorrows() {
    this.borrowService.getAllBorrows().subscribe(res => {
      this.borrows = res;
      this.borrows.forEach(b => (b.maVachChon = b.maVachChon ?? []));
      this.filteredBorrows = res;
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
        const isHeldByAnother = book.maDat && book.maDat !== borrow.maDat;
        // 2. Sách bị đơn khác mượn (Đang mượn VÀ MaDat khác đơn hiện tại)
        if (isHeldByAnother) {
          this.maVachDaBiNguoiKhacDat.push(book.maVach + '');
        }
      });
      

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
 toggleChon(maVach: string, tinhTrang: string, bookMaDat?: number | null) {
    if (!this.selectedBorrow) return;
    
    // ⭐️ SỬA ĐIỀU KIỆN CHÍNH XÁC HƠN CHO DISABLE/CHỌN:
    const isCurrentlyDisabled = this.maVachDaBiNguoiKhacDat.includes(maVach);
    const isAlreadySelected = this.daChon.includes(maVach);

    // Nếu sách bị disable VÀ KHÔNG phải là sách đang được chọn của đơn này (chỉ cho phép bỏ chọn)
    if (isCurrentlyDisabled && !isAlreadySelected) {
        return; 
    }
    
    // Logic thêm/bỏ chọn (giữ nguyên)
    const idx = this.daChon.indexOf(maVach);

    if (idx >= 0) {
      this.daChon.splice(idx, 1); // bỏ chọn
    } else {
        // Kiểm tra số lượng tối đa nếu cần thiết ở đây
        if (this.daChon.length < this.soLuongToiDa) {
             this.daChon.push(maVach);
        } else {
             alert(`Đã đạt số lượng đặt tối đa: ${this.soLuongToiDa} cuốn.`);
        }
    }
}

  // Nhấn nút OK trong modal duyệt
  confirmDuyet() {
    if (!this.selectedBorrow) return;

    if (this.daChon.length === 0) {
      alert('Vui lòng chọn ít nhất một mã vạch để gán vào yêu cầu đặt trước.');
      return;
    }

    const maDat = this.selectedBorrow.maDat!;
    this.successChon = [...this.daChon];
    const updates: Observable<any>[] = []; // Phải là Observable

    // Lọc ra các cuốn sách đang được gán cho đơn này (MaDat trùng)
    const maVachDaDuocGaiCuaDonNay = this.danhSachCuonSach
        .filter(c => c.maDat === maDat)
        .map(c => c.maVach + '');
    
    // 1. Xử lý các cuốn sách ĐÃ CHỌN: Gán Mã Vạch vào Mã Đặt
    this.daChon.forEach(maVach => {
        // Chỉ gọi API gán nếu cuốn sách chưa được gán cho đơn này (tránh gọi lại API không cần thiết)
        if (!maVachDaDuocGaiCuaDonNay.includes(maVach)) {
            // ⭐️ Sử dụng API mới để GÁN SÁCH
            updates.push(this.borrowService.assignReservationToItem(maVach, maDat));
        }
    });

    // 2. Xử lý SÁCH BỊ BỎ CHỌN: Giải phóng Mã Đặt (MaDat: null) và TinhTrang: Tot
    const listBoChon = maVachDaDuocGaiCuaDonNay.filter(mv => !this.daChon.includes(mv));
    listBoChon.forEach(maVach => {
        // Dùng updateTinhTrang để giải phóng quyền sở hữu
        updates.push(this.borrowService.updateTinhTrang(maVach, 'Tot', null));
    });

    // 3. Chạy forkJoin cho tất cả
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
            alert('Cập nhật trạng thái sách gặp lỗi! Vui lòng kiểm tra console.');
        }
    });
    // Bỏ qua bước gọi API updateStatus('DaNhan') riêng biệt vì đã được xử lý trong assignReservationToItem ở backend.
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
          this.borrowService.updateTinhTrang(String(c.maVach), "Tot", null)
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
  // Xử lý tìm kiếm
  filterBorrows() {
    // 1. Nếu không có từ khóa tìm kiếm, reset về mảng gốc
    if (!this.searchTerm) {
      this.filteredBorrows = this.borrows;
      this.currentPage = 1; // Reset trang
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();

    // 2. Lọc mảng gốc (this.borrows)
    this.filteredBorrows = this.borrows.filter(borrow => {
      // Chuyển MaDg và MaSach thành chuỗi và so sánh với từ khóa
      const maDgMatch = borrow.maDg?.toString().toLowerCase().includes(term);
      const maSachMatch = borrow.maSach?.toString().toLowerCase().includes(term);

      // Yêu cầu khớp với MaDg HOẶC MaSach
      return maDgMatch || maSachMatch;
    });

    this.currentPage = 1; // Reset về trang đầu tiên sau khi lọc
  }

  // Xử lý xóa tìm kiếm
  clearSearch() {
    this.searchTerm = '';
    this.filterBorrows(); // Gọi lại hàm lọc để reset danh sách
  }
  // Tổng số trang
  get totalPages(): number {
    return Math.ceil(this.filteredBorrows.length / this.itemsPerPage);
  }

  // Dữ liệu theo từng trang
  get paginatedBorrows(): DatTruoc[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // Cắt lát từ filteredBorrows
    return this.filteredBorrows.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Chuyển trang
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  // --- CÁC HÀM MỚI CHO CHỨC NĂNG TẠO PHIẾU ---

  openCreateLoanModal() {
    this.showModalCreateLoan = true;
    this.inputMaDg = null;
    this.loanItems = [];
    this.checkMessage = '';
    this.initializeNgayTra();
  }
  initializeNgayTra() {
    const today = new Date();
    // Đặt ngày mặc định là 7 ngày sau
    //today.setDate(today.getDate() + 7); 

    // Format ngày thành chuỗi YYYY-MM-DD (format bắt buộc của <input type="date">)
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Tháng (0-11)
    const dd = String(today.getDate()).padStart(2, '0');

    this.selectedNgayTra = `${yyyy}-${mm}-${dd}`;
  }
  closeCreateLoanModal() {
    this.showModalCreateLoan = false;
  }
  
  // Hàm xử lý nút OK (Check Độc Giả)
  checkDocGia() {
    if (!this.inputMaDg) {
      this.checkMessage = 'Vui lòng nhập mã độc giả.';
      this.checkMessageType = 'alert-warning';
      return;
    }

    // 1. Lọc các yêu cầu của Mã ĐG này có trạng thái 'DaNhan' từ danh sách borrows hiện có
    const requests = this.borrows.filter(b =>
      b.maDg === this.inputMaDg && b.trangThai === 'DaNhan'
    );

    if (requests.length === 0) {
      this.checkMessage = 'Không tìm thấy yêu cầu "Đã Nhận" nào cho độc giả này.';
      this.checkMessageType = 'alert-danger';
      this.loanItems = [];
      return;
    }

    this.checkMessage = `Tìm thấy ${requests.length} yêu cầu.`;
    this.checkMessageType = 'alert-success';

    // 2. Gộp các yêu cầu cùng Mã Sách lại (để tính tổng số lượng)
    const groupedItems: { [key: number]: number } = {};

    requests.forEach(req => {
      if (req.maSach) {
        // Cộng dồn số lượng
        groupedItems[req.maSach] = (groupedItems[req.maSach] || 0) + req.soLuong;
      }
    });

    // 3. Lấy thông tin Tên Sách (TuaSach) từ SachService
    this.loanItems = []; // Reset bảng
    const listMaSach = Object.keys(groupedItems).map(k => Number(k));

    // Tạo danh sách các lệnh gọi API lấy tên sách
    const apiCalls = listMaSach.map(maSach =>
      this.sachService.getSachById(maSach)
    );

    forkJoin(apiCalls).subscribe({
      next: (books) => {
        // books là mảng chứa thông tin chi tiết của từng cuốn sách
        books.forEach(book => {
          this.loanItems.push({
            maSach: book.maSach,
            tuaSach: book.tuaSach, // Giả sử model Sach có field tenSach
            soLuong: groupedItems[book.maSach]
          });
        });
      },
      error: (err) => {
        console.error('Lỗi khi lấy thông tin sách:', err);
        this.checkMessage = 'Có lỗi khi tải thông tin sách.';
        this.checkMessageType = 'alert-danger';
      }
    });
  }
  // Hàm xử lý nút OK (Modal Tạo Phiếu Thành Công)
  okSuccessCreate() {
        this.showModalSuccessCreate = false; 
        
        
        this.closeCreateLoanModal(); 
        this.phieuMuonSharedService.notifyPhieuMuonCreated(); 
        this.loadBorrows(); 
    }

  confirmCreateLoan() {
    
    if (this.loanItems.length === 0 || !this.inputMaDg || !this.selectedNgayTra) {
        alert('Vui lòng kiểm tra lại thông tin!');
        return;
    }
     //  Lấy Mã Nhân Viên thực tế
    const maNv = this.authService.getMaNv();
    console.log("MaNV đang được gửi đi:", maNv);
    if (!maNv) {
      alert('Không thể xác định Mã Nhân Viên. Vui lòng đăng nhập lại.');
      return;
    }
    // 2. KHAI BÁO VÀ GÁN GIÁ TRỊ CHO loanData TẠI ĐÂY
    const loanData = {
        maDg: this.inputMaDg,
        maNv: maNv, // Thay thế bằng Mã nhân viên thực tế (ví dụ: lấy từ AuthService)
        ngayTra: this.selectedNgayTra // Định dạng YYYY-MM-DD (được gửi từ <input type="date">)
        // Lưu ý: Không cần gửi chi tiết sách (MaVach) vì Backend sẽ tự tìm
    };

    // 3. Gọi Service với loanData đã được định nghĩa
    this.phieuMuonService.create(loanData).subscribe({
        next: (res) => {
          this.showModalCreateLoan = false;
          this.latestMaPM = res.maPM; 
          this.successMessage = `Tạo phiếu mượn thành công! Mã Phiếu: ${res.maPM}`;
          
          this.showModalSuccessCreate = true;
          console.log("ModalSuccessCreate =", this.showModalSuccessCreate);
        },
        error: (err) => {
            console.error("Lỗi khi tạo phiếu mượn: ", err);
            alert("Có lỗi xảy ra trong quá trình tạo phiếu mượn!");
        }
    });
}
}
