
export interface DatTruoc {
  maDat: number;
  maDg?: number;
  maSach?: number;
  ngayDat?: string; 
  trangThai?: 'Cho' | 'DaNhan' | 'Huy';
  soLuong: number;

  maVachChon?: string[];
}
