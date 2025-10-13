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
    MaTL nvarchar(50),
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
    MaTL nvarchar(50),
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



INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (1, N'Tôi tự học', 1945, N'NXB Trẻ', 10, N'KYNANG', N'Sách kinh điển về phương pháp tự học và rèn luyện trí tuệ.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (2, N'Đắc nhân tâm', 1936, N'NXB Tổng Hợp', 10, N'TAMLY', N'Sách dạy kỹ năng giao tiếp, ứng xử nổi tiếng nhất thế giới.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (3, N'7 thói quen hiệu quả của bạn trẻ thành đạt', 1998, N'NXB Trẻ', 10, N'KYNANG', N'Hướng dẫn hình thành thói quen tốt để đạt được thành công.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (4, N'Tôi tài giỏi, bạn cũng thế', 2002, N'NXB Trẻ', 10, N'KYNANG', N'Sách truyền cảm hứng và phương pháp học tập hiệu quả cho học sinh, sinh viên.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (5, N'Làm chủ tư duy, thay đổi vận mệnh', 2003, N'NXB Trẻ', 10, N'KYNANG', N'Giúp bạn khám phá tiềm năng và thay đổi bản thân qua tư duy tích cực.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (6, N'Tuổi trẻ đáng giá bao nhiêu?', 2016, N'NXB Hội Nhà Văn', 10, N'TAMLY', N'Cuốn sách truyền cảm hứng sống hết mình cho tuổi trẻ.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (7, N'Cà phê cùng Tony', 2015, N'NXB Trẻ', 10, N'TAMLY', N'Tập hợp những câu chuyện truyền cảm hứng về cuộc sống và sự nghiệp.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (8, N'Khéo ăn khéo nói sẽ có được thiên hạ', 2015, N'NXB Văn Học', 10, N'KYNANG', N'Bí quyết giao tiếp, ứng xử thông minh trong cuộc sống và công việc.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (9, N'Thế giới phẳng', 2005, N'NXB Trẻ', 10, N'KINHTE', N'Phân tích toàn cầu hóa và những cơ hội trong thời đại mới.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (10, N'Trên đường băng', 2017, N'NXB Trẻ', 10, N'TAMLY', N'Cuốn sách định hướng tư duy tích cực và khát vọng sống cho người trẻ.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (11, N'Đừng lựa chọn an nhàn khi còn trẻ', 2017, N'NXB Văn Học', 10, N'TAMLY', N'Lời nhắc nhở giới trẻ phải sống nhiệt huyết, không lười biếng.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (12, N'Hạt giống tâm hồn', 2002, N'NXB Tổng Hợp', 10, N'TAMLY', N'Tuyển tập những câu chuyện truyền cảm hứng về cuộc sống.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (13, N'Tuổi trẻ không trì hoãn', 2014, N'NXB Văn Học', 10, N'KYNANG', N'Giúp bạn trẻ nhận ra giá trị của thời gian và hành động kịp lúc.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (14, N'Dám nghĩ lớn', 1959, N'NXB Trẻ', 10, N'KYNANG', N'Sách kinh điển truyền cảm hứng hành động mạnh mẽ để đạt thành công.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (15, N'Đi tìm lẽ sống', 1946, N'NXB Văn Học', 10, N'TAMLY', N'Tác phẩm nổi tiếng về ý nghĩa cuộc sống và sức mạnh tinh thần.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (16, N'Không gia đình', 1878, N'NXB Văn Học', 10, N'VANHOC', N'Tiểu thuyết nổi tiếng của Hector Malot, kể về hành trình gian nan và nghị lực của cậu bé Remi.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (17, N'Hiệu ứng chim mồi', 2017, N'NXB Kinh Tế', 10, N'KINHTE', N'Sách về tư duy lựa chọn và tác động của tâm lý trong quyết định.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (18, N'Khởi nghiệp tinh gọn', 2011, N'NXB Trẻ', 10, N'KINHTE', N'Cuốn sách hướng dẫn phương pháp khởi nghiệp tiết kiệm và hiệu quả.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (19, N'Tâm lý học thành công', 2006, N'NXB Lao Động', 10, N'TAMLY', N'Nghiên cứu cách tư duy ảnh hưởng đến thành công của con người.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (20, N'Dạy con làm giàu – Tập 1', 1997, N'NXB Trẻ', 10, N'KINHTE', N'Tác phẩm nổi tiếng của Robert Kiyosaki về tư duy tài chính và đầu tư.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (21, N'Tư bản', 1867, N'NXB Chính trị Quốc gia', 3, N'KINHTE', N'Tác phẩm kinh điển của Karl Marx về kinh tế chính trị.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (22, N'Quốc gia khởi nghiệp', 2009, N'NXB Trẻ', 7, N'KINHTE', N'Phân tích sự phát triển kinh tế và đổi mới của Israel.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (23, N'7 thói quen của người thành đạt', 1989, N'NXB Trẻ', 10, N'TAMLY', N'Tác phẩm phát triển bản thân nổi tiếng của Stephen R. Covey.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (24, N'Tiếng gọi nơi hoang dã', 1903, N'NXB Văn Học', 6, N'VANHOC', N'Tiểu thuyết phiêu lưu của Jack London.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (25, N'Hoàng tử bé', 1943, N'NXB Văn Học', 10, N'VANHOC', N'Tác phẩm triết lý dành cho mọi lứa tuổi của Antoine de Saint-Exupéry.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (26, N'Sherlock Holmes Toàn tập', 1892, N'NXB Văn Học', 8, N'VANHOC', N'Truyện trinh thám nổi tiếng của Arthur Conan Doyle.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (27, N'Câu chuyện triết học', 2015, N'NXB Tri thức', 4, N'KHOAHOC', N'Tài liệu nhập môn triết học cơ bản.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (28, N'Kỹ thuật lập trình', 2023, N'NXB Giáo dục', 6, N'CNTT', N'Sách lập trình cơ bản cho sinh viên CNTT.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (29, N'Lịch sử thế giới hiện đại', 2000, N'NXB Lịch sử', 3, N'LICHSU', N'Tổng quan lịch sử thế giới từ thế kỷ 19 đến nay.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (30, N'Kinh tế học vĩ mô', 2018, N'NXB Kinh tế Quốc dân', 5, N'KINHTE', N'Giáo trình kinh tế học vĩ mô cho sinh viên.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (31, N'Nhà giả kim', 1988, N'NXB Văn Học', 10, N'VANHOC', N'Tác phẩm nổi tiếng của Paulo Coelho về hành trình theo đuổi ước mơ.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (32, N'Harry Potter và Hòn đá Phù thủy', 1997, N'NXB Trẻ', 12, N'THIEUNHI', N'Tập đầu tiên trong loạt truyện Harry Potter của J.K. Rowling.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (33, N'Harry Potter và Phòng chứa bí mật', 1998, N'NXB Trẻ', 12, N'THIEUNHI', N'Tập thứ hai trong loạt Harry Potter.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (34, N'Harry Potter và Tù nhân ngục Azkaban', 1999, N'NXB Trẻ', 12, N'THIEUNHI', N'Tập thứ ba trong loạt Harry Potter.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (35, N'Harry Potter và Chiếc cốc lửa', 2000, N'NXB Trẻ', 12, N'THIEUNHI', N'Tập thứ tư trong loạt Harry Potter.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (36, N'Harry Potter và Hội Phượng Hoàng', 2003, N'NXB Trẻ', 12, N'THIEUNHI', N'Tập thứ năm trong loạt Harry Potter.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (37, N'Harry Potter và Hoàng tử lai', 2005, N'NXB Trẻ', 12, N'THIEUNHI', N'Tập thứ sáu trong loạt Harry Potter.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (38, N'Harry Potter và Bảo bối Tử thần', 2007, N'NXB Trẻ', 12, N'THIEUNHI', N'Tập cuối cùng trong loạt Harry Potter.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (39, N'Chiến binh cầu vồng', 2005, N'NXB Văn Học', 8, N'VANHOC', N'Tác phẩm cảm động của Andrea Hirata về tuổi thơ và ước mơ.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (40, N'Trăm năm cô đơn', 1967, N'NXB Văn Học', 6, N'VANHOC', N'Tiểu thuyết nổi tiếng của Gabriel García Márquez, đoạt giải Nobel.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (61, N'Sách cờ tướng', NULL, NULL, 1, N'TROCHOI', N'Chơi Cờ Tướng Như Thế Nào cung cấp cho các bạn mới chơi cờ những kiến thức cơ bản: Khai cuộc - Trung cuộc - Tàn cuộc.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (62, N'Sách học bơi', NULL, NULL, 1, N'THECHAT', N'Tập bơi giúp rèn luyện cơ thể và củng cố lòng tin trước sông nước, phù hợp điều kiện tự nhiên ở Việt Nam.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (63, N'Sách cờ vua', NULL, NULL, 1, N'TROCHOI', N'Tài liệu hướng dẫn cơ bản và nâng cao về chiến thuật, khai cuộc và tàn cuộc trong cờ vua.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (64, N'Cầu lông', NULL, NULL, 1, N'THECHAT', N'Sách cung cấp kiến thức cơ bản về kỹ thuật và chiến thuật chơi cầu lông.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (65, N'Vẽ kĩ thuật cơ khí', NULL, NULL, 1, N'COKHIDIENTU', N'Tài liệu về các tiêu chuẩn, ký hiệu và phương pháp vẽ kỹ thuật trong cơ khí.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (66, N'Xử lý tín hiệu', NULL, NULL, 1, N'COKHIDIENTU', N'Sách trình bày các nguyên lý và ứng dụng của xử lý tín hiệu số và tương tự.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (67, N'Tự động hóa hệ thống lạnh', NULL, NULL, 1, N'COKHIDIENTU', N'Tài liệu nghiên cứu và ứng dụng tự động hóa trong hệ thống lạnh công nghiệp.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (68, N'Kỹ thuật lập trình C', NULL, NULL, 1, N'CNTT', N'Giáo trình giới thiệu cú pháp, cấu trúc và kỹ thuật lập trình ngôn ngữ C.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (69, N'Điện toán đám mây', NULL, NULL, 1, N'CNTT', N'Tài liệu tổng quan và ứng dụng công nghệ điện toán đám mây trong CNTT.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (70, N'Code dạo ký sự', NULL, NULL, 1, N'CNTT', N'Câu chuyện và trải nghiệm thực tế về ngành CNTT.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (71, N'Giáo trình Quản trị Kinh doanh', NULL, NULL, 1, N'KINHDOANH', N'Giáo trình cung cấp các kiến thức cơ bản về quản trị và điều hành doanh nghiệp.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (72, N'Kỹ năng quản lý hiệu quả', NULL, NULL, 1, N'KINHDOANH', N'Sách kỹ năng dành cho nhà quản lý nhằm nâng cao hiệu suất công việc.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (73, N'Tự học Tiếng Pháp trong 24h', NULL, NULL, 1, N'NGONNGU', N'Tài liệu tự học nhanh tiếng Pháp cho người mới bắt đầu.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (74, N'Tiếng Đức cho người Việt', NULL, NULL, 1, N'NGONNGU', N'Giáo trình nhập môn tiếng Đức dành cho người Việt.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (75, N'Tục ngữ Nga', NULL, NULL, 1, N'NGONNGU', N'Tuyển tập tục ngữ Nga, có giải thích ý nghĩa và ngữ cảnh sử dụng.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (76, N'Vật lý đại cương', NULL, NULL, 1, N'KHOAHOC', N'Giáo trình cơ bản về cơ học, nhiệt học, điện học và quang học.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (77, N'Toán rời rạc', NULL, NULL, 1, N'KHOAHOC', N'Sách học về logic toán, tập hợp, quan hệ, hàm và đồ thị.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (78, N'Luận án tiến sĩ Kinh tế', NULL, NULL, 1, N'LUANAN', N'Nghiên cứu chuyên sâu thuộc lĩnh vực kinh tế.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (79, N'Đồ án CNTT xây dựng wifi', NULL, NULL, 1, N'LUANAN', N'Đồ án tốt nghiệp về thiết kế và triển khai hệ thống wifi.')
INSERT [dbo].[Sach] ([MaSach], [TuaSach], [NamXB], [NhaXB], [SoLuong], [MaTL], [GioiThieu]) VALUES (80, N'Đồ án thiết kế hệ thống điều chỉnh nhiệt độ thiết bị sấy hoa quả', NULL, NULL, 1, N'LUANAN', N'Nghiên cứu và thiết kế hệ thống điều khiển nhiệt độ cho thiết bị sấy hoa quả.')
GO
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'CNTT', N'Công nghệ thông tin')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'COKHIDIENTU', N'Cơ khí - Điện tử')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'KHOAHOC', N'Khoa học')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'KINHDOANH', N'Kinh doanh')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'KINHTE', N'Kinh tế')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'KYNANG', N'Kỹ năng sống')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'LICHSU', N'Lịch sử')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'LUANAN', N'Luận án')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'NGONNGU', N'Ngôn ngữ')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'TAMLY', N'Tâm lý - Phát triển bản thân')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'THECHAT', N'Thể chất')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'THIEUNHI', N'Thiếu nhi')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'TROCHOI', N'Trò chơi')
INSERT [dbo].[TheLoai] ([MaTL], [TenTL]) VALUES (N'VANHOC', N'Văn học')
GO