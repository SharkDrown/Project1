-- ===============================
-- Tạo cơ sở dữ liệu
-- ===============================
CREATE DATABASE QuanLyThuVien;
GO

USE QuanLyThuVien;
GO

-- ===============================
-- Bảng Tài khoản
-- ===============================
CREATE TABLE TaiKhoan (
    MaTK INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap NVARCHAR(50) UNIQUE NOT NULL,
    MatKhau NVARCHAR(255) NOT NULL,
    VaiTro NVARCHAR(20) CHECK (VaiTro IN ('DocGia','NhanVien','Admin')),
    TrangThai BIT DEFAULT 1
);

-- ===============================
-- Bảng Độc giả
-- ===============================
CREATE TABLE DocGia (
    MaDG INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    NgaySinh DATE,
    DiaChi NVARCHAR(255),
    Email NVARCHAR(100) UNIQUE,
    SoDT NVARCHAR(20),
    MaTK INT UNIQUE,
    FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
);

-- ===============================
-- Bảng Nhân viên
-- ===============================
CREATE TABLE NhanVien (
    MaNV INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    ChucVu NVARCHAR(50),
    Email NVARCHAR(100) UNIQUE,
    SoDT NVARCHAR(20),
    MaTK INT UNIQUE,
    FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
);

-- ===============================
-- Bảng Thể loại
-- ===============================
CREATE TABLE TheLoai (
    MaTL INT IDENTITY(1,1) PRIMARY KEY,
    TenTL NVARCHAR(100) NOT NULL
);

-- ===============================
-- Bảng Tác giả
-- ===============================
CREATE TABLE TacGia (
    MaTG INT IDENTITY(1,1) PRIMARY KEY,
    TenTG NVARCHAR(100) NOT NULL
);

-- ===============================
-- Bảng Sách
-- ===============================
CREATE TABLE Sach (
    MaSach INT IDENTITY(1,1) PRIMARY KEY,
    TuaSach NVARCHAR(255) NOT NULL,
    NamXB INT,
    NhaXB NVARCHAR(100),
    SoLuong INT DEFAULT 1,
    MaTL INT,
    FOREIGN KEY (MaTL) REFERENCES TheLoai(MaTL)
);

-- Bảng liên kết Sách - Tác giả (nhiều-nhiều)
CREATE TABLE Sach_TacGia (
    MaSach INT,
    MaTG INT,
    PRIMARY KEY (MaSach, MaTG),
    FOREIGN KEY (MaSach) REFERENCES Sach(MaSach),
    FOREIGN KEY (MaTG) REFERENCES TacGia(MaTG)
);

-- ===============================
-- Bảng Phiếu mượn
-- ===============================
CREATE TABLE PhieuMuon (
    MaPM INT IDENTITY(1,1) PRIMARY KEY,
    MaDG INT,
    MaNV INT,
    NgayMuon DATE DEFAULT GETDATE(),
    NgayTra DATE,
    FOREIGN KEY (MaDG) REFERENCES DocGia(MaDG),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);

-- Chi tiết phiếu mượn
CREATE TABLE ChiTietPhieuMuon (
    MaPM INT,
    MaSach INT,
    NgayTraThucTe DATE,
    PRIMARY KEY (MaPM, MaSach),
    FOREIGN KEY (MaPM) REFERENCES PhieuMuon(MaPM),
    FOREIGN KEY (MaSach) REFERENCES Sach(MaSach)
);

-- ===============================
-- Bảng Phiếu phạt
-- ===============================
CREATE TABLE PhieuPhat (
    MaPP INT IDENTITY(1,1) PRIMARY KEY,
    MaDG INT NOT NULL, -- Người bị phạt
    MaPM INT NULL,     -- Phiếu mượn liên quan (nếu có)
    LyDo NVARCHAR(255) NOT NULL,
    SoTien DECIMAL(10,2) NOT NULL,
    NgayPhat DATE DEFAULT GETDATE(),
    FOREIGN KEY (MaDG) REFERENCES DocGia(MaDG),
    FOREIGN KEY (MaPM) REFERENCES PhieuMuon(MaPM)
);

-- ===============================
-- Bảng Đặt trước
-- ===============================
CREATE TABLE DatTruoc (
    MaDat INT IDENTITY(1,1) PRIMARY KEY,
    MaDG INT,
    MaSach INT,
    NgayDat DATE DEFAULT GETDATE(),
    TrangThai NVARCHAR(20) CHECK (TrangThai IN ('Cho','DaNhan','Huy')),
    FOREIGN KEY (MaDG) REFERENCES DocGia(MaDG),
    FOREIGN KEY (MaSach) REFERENCES Sach(MaSach)
);

-- ===============================
-- Bảng Đánh giá sách
-- ===============================
CREATE TABLE DanhGiaSach (
    MaDG INT,
    MaSach INT,
    SoSao INT CHECK (SoSao BETWEEN 1 AND 5),
    BinhLuan NVARCHAR(500),
    NgayDG DATE DEFAULT GETDATE(),
    PRIMARY KEY (MaDG, MaSach),
    FOREIGN KEY (MaDG) REFERENCES DocGia(MaDG),
    FOREIGN KEY (MaSach) REFERENCES Sach(MaSach)
);

-- ===============================
-- Bảng Thông báo
-- ===============================
CREATE TABLE ThongBao (
    MaTB INT IDENTITY(1,1) PRIMARY KEY,
    NoiDung NVARCHAR(500),
    NgayTB DATE DEFAULT GETDATE(),
    MaDG INT,
    FOREIGN KEY (MaDG) REFERENCES DocGia(MaDG)
);

-- ===============================
-- Bảng Báo cáo (chỉ lưu link)
-- ===============================
CREATE TABLE BaoCao (
    MaBC INT IDENTITY(1,1) PRIMARY KEY,
    LoaiBC NVARCHAR(50),
    LinkFile NVARCHAR(255), -- chỉ lưu đường dẫn
    NgayLap DATETIME DEFAULT GETDATE(),
    MaNV INT,
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);

-- ===============================
-- Lịch sử đăng nhập
-- ===============================
CREATE TABLE LichSuDangNhap (
    MaLS INT IDENTITY(1,1) PRIMARY KEY,
    MaTK INT,
    ThoiGian DATETIME DEFAULT GETDATE(),
    DiaChiIP NVARCHAR(50),
    FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
);

-- ===============================
-- Lịch sử cập nhật tài khoản
-- ===============================
CREATE TABLE LichSuCapNhatTaiKhoan (
    MaLS INT IDENTITY(1,1) PRIMARY KEY,
    MaTK INT,
    ThoiGian DATETIME DEFAULT GETDATE(),
    HanhDong NVARCHAR(255),
    FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
);

CREATE TABLE RefreshToken (
    MaToken INT IDENTITY(1,1) PRIMARY KEY,
    MaTK INT NOT NULL,
    Token NVARCHAR(255) NOT NULL,
    ExpiryDate DATETIME NOT NULL,
    IsRevoked BIT DEFAULT 0,
    FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
);
ALTER TABLE TaiKhoan ADD LastActive DATETIME NULL;
