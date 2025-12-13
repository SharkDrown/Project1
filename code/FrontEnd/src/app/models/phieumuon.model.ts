export interface PhieuMuon {
  maPm: number;
  ngayMuon: string | Date;
  ngayTra: string | Date | null;
  items: PhieuMuonItem[];
}

export interface PhieuMuonItem {
  maSach: number;
  tuaSach: string;
  theLoai: string | null;
  soLuong: number;
}