
export interface DatTruoc {
  maDat: number;
  maDg?: number;
  maSach?: number;
  ngayDat?: string; 
  trangThai?: 'Cho' | 'DaNhan' | 'Huy';
  soLuong: number;
    // Mảng lưu mã vạch người dùng đã chọn (frontend)
  maVachChon?: string[];
}
