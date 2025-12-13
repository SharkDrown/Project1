import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhieuMuonService } from '../../services/phieumuon.service';
import { PhieuMuonSharedService } from '../../services/phieumuonshared.service';
import { AuthService } from '../../services/auth.service';
import { FineService } from '../../services/fine.service';
import { FineTicketDto } from '../../models/fineticket.model';

export interface BookStatus {
  maVach: string;
  maSach: number;
  tuaSach: string;
  ngayMuon: string | null;
  ngayTra: string | null;
  ngayTraThucTe: string | null;
  maDg: number | null;
  tenDg: string | null;
  trangThai: 'DangMuon' | 'Tot' | 'Hong' | 'Mat';
  maPm: number | null;

}

@Component({
  selector: 'app-return',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './return.component.html',
  styleUrl: './return.component.css'
})
export class ReturnComponent implements OnInit {
  phieuMuons: any[] = [];
  searchTerm: string = ''; // Biến cho ô tìm kiếm
  filteredPhieuMuons: any[] = [];
  // Thuộc tính cho tab Trạng Thái Sách
  dataSource: BookStatus[] = []; // Dữ liệu gốc từ API
  filteredStatusData: BookStatus[] = []; // Dữ liệu đã lọc/tìm kiếm
  statusSearchTerm: string = ''; // Biến cho ô tìm kiếm Trạng Thái Sách

  currentMaNv: number | null = null;
  // Quản lý tab hiện tại
  activeTab: 'muon' | 'trangthai' = 'muon';
  // Phân trang cho phiếu mượn
  loanCurrentPage: number = 1;
  // Phân trang cho tab trạng thái sách
  statusCurrentPage: number = 1;
  // Mỗi trang 10 dữ liêu
  itemsPerPage: number = 10;
  // Modal Phiếu phạt
  isFineModalOpen: boolean = false;
  fineMaPm: string = '';       // Mã phiếu mượn nhập vào
  fineReason: string = '';     // Nội dung khung Text lý do
  fineTotalAmount: number = 0; // Tổng tiền phạt
  // Tiền phạt
  readonly FINE_LATE = 50000;
  readonly FINE_DAMAGED = 30000;
  readonly FINE_LOST = 100000;
  // Hiển thị modal tạo phạt thành công
  isSuccessModalOpen: boolean = false;
  newFineTicketCode: string = '';
  constructor(private phieuMuonService: PhieuMuonService,
    private phieuMuonSharedService: PhieuMuonSharedService,
    private authService: AuthService,
    private fineService: FineService
  ) { }

  ngOnInit(): void {
    this.currentMaNv = this.authService.getMaNv();
    // Tải dữ liệu cho tab mặc định
    if (this.activeTab === 'muon') {
      this.loadData();
    } else if (this.activeTab === 'trangthai') {
      this.loadBookStatusData();
    }

    this.phieuMuonSharedService.phieuMuonCreated$.subscribe(() => {
      this.loadData();
    });
  }
  setActiveTab(tab: 'muon' | 'trangthai'): void {
    this.activeTab = tab;

    if (tab === 'muon') {
      this.loadData();
    } else if (this.activeTab === 'trangthai') {
      // Chỉ tải dữ liệu trạng thái sách nếu chưa có dữ liệu
      if (this.dataSource.length === 0) {
        this.loadBookStatusData();
      } else {
        this.applyStatusFilter(); // Áp dụng bộ lọc hiện tại
      }
    }
  }
  // Logic phân trang cho tab phiếu mượn
  // Tổng số trang cho Phiếu Mượn
  get loanTotalPages(): number {
    return Math.ceil(this.filteredPhieuMuons.length / this.itemsPerPage);
  }

  // Dữ liệu Phiếu Mượn cho trang hiện tại
  get paginatedLoans(): any[] {
    const startIndex = (this.loanCurrentPage - 1) * this.itemsPerPage;
    return this.filteredPhieuMuons.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Hàm chuyển trang cho Phiếu Mượn
  changeLoanPage(page: number) {
    if (page >= 1 && page <= this.loanTotalPages) {
      this.loanCurrentPage = page;
    }
  }
  // Phân trang cho tab trạng thái sách
  // Tổng số trang cho Trạng Thái Sách
  get statusTotalPages(): number {
    return Math.ceil(this.filteredStatusData.length / this.itemsPerPage);
  }

  // Dữ liệu Trạng Thái Sách cho trang hiện tại
  get paginatedStatusData(): BookStatus[] {
    const startIndex = (this.statusCurrentPage - 1) * this.itemsPerPage;
    return this.filteredStatusData.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Hàm chuyển trang cho Trạng Thái Sách
  changeStatusPage(page: number) {
    if (page >= 1 && page <= this.statusTotalPages) {
      this.statusCurrentPage = page;
    }
  }
  getPageNumbers(currentPage: number, totalPages: number): number[] {
    const maxPagesToShow = 5;
    const pages: number[] = [];

    if (totalPages <= maxPagesToShow) {
      // Trường hợp tổng số trang ít, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Trường hợp tổng số trang nhiều
      const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      // Điều chỉnh startPage nếu endPage chạm mốc totalPages
      let actualStartPage = Math.max(1, endPage - maxPagesToShow + 1);

      for (let i = actualStartPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }
  loadData() {
    // Nếu không có MaNv hoặc chưa đăng nhập, chỉ hiển thị nếu là Admin (có quyền xem tất cả)
    if (!this.authService.isLoggedIn()) {
      console.warn("Người dùng chưa đăng nhập. Không tải dữ liệu.");
      this.phieuMuons = [];
      this.filteredPhieuMuons = [];
      return;
    }

    this.phieuMuonService.getAll().subscribe({
      next: (allRes: any[]) => {
        // Chỉ Admin mới xem được tất cả, Nhân viên chỉ xem giao dịch của mình
        if (this.authService.getRole() === 'Admin') {
          this.phieuMuons = allRes;
        } else if (this.authService.getRole() === 'NhanVien') {
          // Gán thẳng kết quả API (vì API đã được sửa để trả về toàn bộ)
          this.phieuMuons = allRes;
        }
        else {
          // Trường hợp Nhân viên không lấy được MaNv
          this.phieuMuons = [];
          console.error("Không tìm thấy Mã Nhân viên (MaNv) trong token.");
        }
        this.applyFilter();
        this.loanCurrentPage = 1;
      },
      error: (err) => {
        console.error("Lỗi tải danh sách phiếu mượn: ", err);
      }
    });
  }

  // Hàm tìm kiếm (Filter)
  applyFilter() {
    // 1. Nếu searchTerm rỗng, hiển thị toàn bộ danh sách
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredPhieuMuons = this.phieuMuons;
      return;
    }

    // Chuyển từ khóa tìm kiếm về chữ thường và loại bỏ khoảng trắng thừa
    const lowerCaseSearch = this.searchTerm.toLowerCase().trim();
    this.loanCurrentPage = 1;
    this.filteredPhieuMuons = this.phieuMuons.filter(pm => {
      // Lọc theo Mã độc giả (maDg)
      const matchDg = pm.maDg?.toString().includes(lowerCaseSearch);
      // Lọc theo Mã nhân viên (maNv)
      const matchNv = pm.maNv?.toString().includes(lowerCaseSearch);
      // Lọc theo Mã phiếu mượn (maPm)
      const matchPm = pm.maPm?.toString().includes(lowerCaseSearch);

      return matchDg || matchNv || matchPm;
    });


    // console.log('Kết quả lọc:', this.filteredPhieuMuons);
  }

  /**
   * ⭐️ HÀM MỚI: Kiểm tra xem một Phiếu Mượn có thể bị xóa hay không.
   * Phiếu chỉ có thể bị xóa nếu TẤT CẢ cuốn sách trong phiếu đó đã được trả (trạng thái Tot/Hong/Mat).
   * @param maPm Mã Phiếu Mượn cần kiểm tra.
   * @returns true nếu không còn cuốn sách nào trong trạng thái 'DangMuon' thuộc về maPm này.
   */
  canDeletePhieu(maPm: number): boolean {
    // Đảm bảo maPm từ HTML và data source đều được xử lý dưới dạng số để so sánh chính xác
    const maPmNumber = Number(maPm);

    // Tìm bất kỳ cuốn sách nào còn ở trạng thái 'DangMuon' thuộc phiếu mượn này
    const unreturnedBooks = this.filteredStatusData.filter(item =>
      Number(item.maPm) === maPmNumber && item.trangThai === 'DangMuon'
    );

    const hasUnreturnedBooks = unreturnedBooks.length > 0;


    if (hasUnreturnedBooks) {

      console.log(`[DEBUG - PM ${maPmNumber}] KHÔNG THỂ XÓA. Vẫn còn ${unreturnedBooks.length} cuốn sách chưa trả:`,
        unreturnedBooks.map(b => b.maVach));
    } else {
      console.log(`[DEBUG - PM ${maPmNumber}] CÓ THỂ XÓA. Không còn sách nào ở trạng thái 'DangMuon'.`);
    }
    const result = !hasUnreturnedBooks;
    console.log(`[DEBUG - PM ${maPmNumber}] GIÁ TRỊ TRẢ VỀ: ${result}`);
    return result;
  }

  deletePhieu(maPM: number) {
    const maPmNumber = Number(maPM);

    if (confirm(`Bạn có chắc muốn xóa phiếu mượn ${maPmNumber} này?`)) {
      this.phieuMuonService.delete(maPmNumber).subscribe({
        next: () => {
          console.log(`Xóa phiếu mượn ${maPmNumber} thành công.`);
          this.loadData();
          this.loadBookStatusData();
          alert(`Xóa phiếu mượn ${maPmNumber} thành công!`);
        },
        error: (err) => {
          console.error("Lỗi khi xóa phiếu mượn:", err);

          let errorMessage = `Không thể xóa phiếu mượn ${maPmNumber}.`;

          // Kiểm tra lỗi 400 hoặc 409 (Conflict) - Lỗi logic nghiệp vụ từ Backend
          if (err.status === 400 || err.status === 409) {
            // Trích xuất thông báo lỗi chi tiết từ Backend nếu có, nếu không dùng thông báo cố định
            const apiError = err.error?.message || err.error;
            errorMessage += `\nLý do: ${apiError || 'Tồn tại sách đang mượn hoặc lỗi nghiệp vụ.'}`;
          } else {
            // Lỗi khác (Mạng, Server)
            errorMessage += `\nLỗi không xác định. Mã lỗi: ${err.status}`;
          }

          alert(errorMessage);
        }
      });
    }
  }
  // --- HÀM CHO TAB TRẠNG THÁI SÁCH (MỚI) ---

  // Tải dữ liệu trạng thái sách từ API
  loadBookStatusData(): void {
    // Gọi API getAllBookItemsWithStatus (API /api/CuonSach/trangthai)
    this.phieuMuonService.getAllBookItemsWithStatus().subscribe({
      next: (data: any[]) => {
        this.dataSource = data as BookStatus[];
        //this.updateFineStatusForData();
        this.applyStatusFilter();
        this.statusCurrentPage = 1;
      },
      error: (err: any) => {
        console.error('Lỗi khi tải trạng thái sách:', err);
        // THAY THẾ alert bằng console.error
        console.error('Lỗi tải trạng thái sách. Vui lòng kiểm tra API /trangthai.');
      }
    });
  }

  // Hàm tìm kiếm và lọc dữ liệu trạng thái sách
  applyStatusFilter(): void {
    const term = this.statusSearchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredStatusData = this.dataSource;
      this.statusCurrentPage = 1;
      return;
    }

    this.filteredStatusData = this.dataSource.filter(item => {
      const generalMatch = item.maVach.toLowerCase().includes(term) ||
        (item.tuaSach && item.tuaSach.toLowerCase().includes(term)) ||
        item.trangThai.toLowerCase().includes(term) ||
        (item.tenDg && item.tenDg.toLowerCase().includes(term));

      const idMatch = (item.maDg !== null && String(item.maDg).includes(term)) ||
        String(item.maSach).includes(term);

      return generalMatch || idMatch;
    });
    this.statusCurrentPage = 1;
  }
  // Hàm này được gọi khi Dropdown thay đổi
  handleStatusUpdate(maVach: string, newStatus: string, currentStatus: string, selectElement: HTMLSelectElement): void {

    if (newStatus === currentStatus) {
      return; // Không làm gì nếu không thay đổi
    }

    // --- BƯỚC 1: XÁC THỰC TRÊN FRONTEND ---
    let message = `Bạn có chắc muốn cập nhật trạng thái sách ${maVach} từ "${currentStatus}" thành "${newStatus}" không?`;

    if (currentStatus === 'DangMuon' && (newStatus === 'Tot' || newStatus === 'Hong' || newStatus === 'Mat')) {
      message = `Thao tác này ghi nhận sách được TRẢ với tình trạng: ${newStatus}.\nBạn có chắc chắn muốn tiếp tục không?`;
    }
    else if (newStatus === 'DangMuon') {

      console.warn("Không thể chuyển trạng thái sang Đang Mượn thủ công. Vui lòng tạo Phiếu Mượn.");
      selectElement.value = currentStatus;
      return;
    }


    if (!confirm(message)) {
      selectElement.value = currentStatus;
      return;
    }

    // --- BƯỚC 2: GỌI API ---
    const index = this.dataSource.findIndex(item => item.maVach === maVach);
    if (index > -1) {
      const oldStatus = this.dataSource[index].trangThai;

      // SỬ DỤNG this.phieuMuonService
      this.phieuMuonService.updateBookItemStatus(maVach, newStatus).subscribe({
        next: (response: any) => {
          // THAY THẾ alert bằng console.log
          console.log(response.message || 'Cập nhật trạng thái thành công!');
          // Tải lại dữ liệu để cập nhật thông tin Chi Tiết Phiếu Mượn (nếu là thao tác trả sách)
          this.loadBookStatusData();
          // Đồng thời tải lại phiếu mượn để cập nhật trạng thái nút xóa
          this.loadData();
        },
        error: (err: any) => {
          console.error('Lỗi cập nhật trạng thái:', err);
          // THAY THẾ alert bằng console.error
          console.error(`Lỗi: ${err.error?.message || 'Không thể cập nhật trạng thái.'}`);

          // Rollback
          selectElement.value = oldStatus;

          //this.updateFineStatusForData();
          this.applyStatusFilter();
        }
      });
    }
  }
  parseDateString(dateString: string | null): Date | null {
    if (!dateString) return null;

    // 1. Chuẩn hóa chuỗi gốc (Thay thế '-' bằng '/')
    let normalizedDateString = dateString.trim().replace(/-/g, '/');
    const parts = normalizedDateString.split('/');

    if (parts.length === 3) {
      // JS constructor: new Date(Năm, Tháng-1, Ngày)
      const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      // Chuẩn hóa về midnight (loại bỏ thời gian) để so sánh chính xác
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return isNaN(dateOnly.getTime()) ? null : dateOnly;
    }
    return null;
  }

  getConditionalValue(item: BookStatus, value: any): any {
    // 1. Trường hợp Sách đang mượn, Hỏng, Mất: LUÔN hiển thị thông tin giao dịch.
    if (item.trangThai === 'DangMuon' || item.trangThai === 'Hong' || item.trangThai === 'Mat') {
      return value || '---';
    }

    // 2. Trường hợp Sách TỐT (Tot)
    if (item.trangThai === 'Tot') {

      // --- LOGIC KIỂM TRA TRẢ MUỘN (Dùng parseDateString) ---
      const expectedDate = this.parseDateString(item.ngayTra);
      const actualDate = this.parseDateString(item.ngayTraThucTe);

      if (!expectedDate || !actualDate) {
        // Nếu thiếu ngày trả dự kiến/thực tế, không thể xác định trả muộn -> ẩn thông tin
        return '---';
      }

      // So sánh: NgayTraThucTe > NgayTra (Dự kiến)
      const isOverdue = actualDate.getTime() > expectedDate.getTime();

      if (isOverdue) {
        // Trường hợp 'Tot' và TRẢ MUỘN -> Giữ lại thông tin
        return value || '---';
      } else {
        // Trường hợp 'Tot' và ĐÚNG HẠN -> Thay bằng ---
        return '---';
      }
    }

    return '---';
  }
  // --- 1. CÁC HÀM QUẢN LÝ MODAL ---
  openFineModal() {
    this.isFineModalOpen = true;
    this.fineMaPm = '';
    this.fineReason = '';
    this.fineTotalAmount = 0;
  }

  closeFineModal() {
    this.isFineModalOpen = false;
  }

  // --- 2. HÀM TÍNH TOÁN PHẠT (Logic cốt lõi) ---
  onCheckFine() {
    if (!this.fineMaPm) {
      alert('Vui lòng nhập Mã Phiếu Mượn!');
      return;
    }

    const searchMaPm = Number(this.fineMaPm);

    // Lọc các cuốn sách thuộc Mã Phiếu Mượn này từ dữ liệu đã tải
    const booksInLoan = this.dataSource.filter(b => b.maPm === searchMaPm);

    if (booksInLoan.length === 0) {
      this.fineReason = `Không tìm thấy sách nào thuộc phiếu mượn ${this.fineMaPm} trong danh sách hiện tại.`;
      this.fineTotalAmount = 0;
      return;
    }

    // Lấy thông tin độc giả từ cuốn sách đầu tiên tìm thấy
    const firstBook = booksInLoan[0];
    const maDg = firstBook.maDg || '---';
    const tenDg = firstBook.tenDg || '---';

    let reasonText = `${maDg} ${tenDg} vi phạm:\n`;
    let totalFine = 0;
    let hasViolation = false;

    // Duyệt qua từng cuốn sách để tính lỗi
    booksInLoan.forEach(book => {
      let bookFine = 0;
      let errors: string[] = [];

      // A. Kiểm tra Trả Muộn
      // Logic: So sánh NgayTraThucTe (hoặc hiện tại) với NgayTra (Dự kiến)
      let isLate = false;
      const expectedDate = this.parseDateString(book.ngayTra);
      // Nếu đã trả thì dùng ngày thực tế, chưa trả thì dùng ngày hiện tại để xét
      const actualDateString = book.ngayTraThucTe
        ? book.ngayTraThucTe
        : new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy format

      const actualDate = this.parseDateString(actualDateString);

      if (expectedDate && actualDate) {
        // So sánh midnight
        const expectedTime = new Date(expectedDate.getFullYear(), expectedDate.getMonth(), expectedDate.getDate()).getTime();
        const actualTime = new Date(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate()).getTime();

        if (actualTime > expectedTime) {
          isLate = true;
        }
      }

      // Cộng tiền phạt muộn
      if (isLate) {
        bookFine += this.FINE_LATE;
        errors.push("Trả muộn");
      }

      // B. Kiểm tra Hỏng / Mất
      if (book.trangThai === 'Hong') {
        bookFine += this.FINE_DAMAGED;
        errors.push("Hỏng");
      } else if (book.trangThai === 'Mat') {
        bookFine += this.FINE_LOST;
        errors.push("Mất");
      }

      // C. Tổng hợp dòng phạt cho cuốn sách này
      if (bookFine > 0) {
        hasViolation = true;
        // Format lỗi: "Trả muộn Hỏng" hoặc "Trả muộn"
        const errorString = errors.join(' ');
        reasonText += `- ${errorString} sách mã ${book.maVach}: ${bookFine.toLocaleString('vi-VN')} đ\n`;
        totalFine += bookFine;
      }
    });

    if (!hasViolation) {
      this.fineReason = `${maDg} ${tenDg}: Không có vi phạm nào cho phiếu mượn này.`;
      this.fineTotalAmount = 0;
    } else {
      this.fineReason = reasonText;
      this.fineTotalAmount = totalFine;
    }
  }

  // --- 3. HÀM XỬ LÝ NÚT TẠO / HỦY (Chưa có chức năng backend) ---
  createFineTicket() {
    if (this.fineTotalAmount === 0) {
      
      return;
    }

    // 1. Đóng Modal hiện tại
    this.closeFineModal();

    // Dữ liệu cần gửi lên API
    const fineData: FineTicketDto = {
      maPm: Number(this.fineMaPm),
      lyDo: this.fineReason,
      soTien: this.fineTotalAmount,
    };

    // 2. Gọi API để tạo Phiếu Phạt
    this.fineService.createFineTicket(fineData).subscribe({
      next: (response) => {
        // 3. Lưu Mã PP và mở Modal Thành công
        this.newFineTicketCode = response.maPp.toString();
        this.isSuccessModalOpen = true;
      },
      error: (errorMessage) => {
        console.error('Lỗi khi tạo phiếu phạt:', errorMessage);
        alert(`Lỗi: ${errorMessage}`);
        // Nếu lỗi, mở lại modal để người dùng xem lại thông báo
        this.openFineModal();
      }
    });
  }
  // Dóng modal tạo phiếu phạt và cập nhật SQL
  confirmFineTicketCreation() {
    // 1. Đóng Modal Thông báo
    this.isSuccessModalOpen = false;

    // 2. Cập nhật dữ liệu trên lưới (tùy chọn)
    this.loadBookStatusData(); // Giả sử hàm này tải lại dữ liệu sách
    // Hoặc chỉ tải lại dữ liệu liên quan đến phiếu mượn nếu cần thiết
    console.log(`Đã xác nhận Phiếu Phạt ${this.newFineTicketCode} và đóng modal.`);
  }
}