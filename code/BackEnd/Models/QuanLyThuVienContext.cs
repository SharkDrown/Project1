using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Models;

public partial class QuanLyThuVienContext : DbContext
{
    public QuanLyThuVienContext()
    {
    }

    public QuanLyThuVienContext(DbContextOptions<QuanLyThuVienContext> options)
        : base(options)
    {
    }

    public virtual DbSet<BaoCao> BaoCaos { get; set; }

    public virtual DbSet<ChiTietPhieuMuon> ChiTietPhieuMuons { get; set; }

    public virtual DbSet<CuonSach> CuonSaches { get; set; }

    public virtual DbSet<DanhGiaSach> DanhGiaSaches { get; set; }

    public virtual DbSet<DatTruoc> DatTruocs { get; set; }

    public virtual DbSet<DocGium> DocGia { get; set; }

    public virtual DbSet<LichSuCapNhatTaiKhoan> LichSuCapNhatTaiKhoans { get; set; }

    public virtual DbSet<LichSuDangNhap> LichSuDangNhaps { get; set; }

    public virtual DbSet<NhanVien> NhanViens { get; set; }

    public virtual DbSet<PhieuMuon> PhieuMuons { get; set; }

    public virtual DbSet<PhieuPhat> PhieuPhats { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<Sach> Saches { get; set; }

    public virtual DbSet<TacGium> TacGia { get; set; }

    public virtual DbSet<TaiKhoan> TaiKhoans { get; set; }

    public virtual DbSet<TheLoai> TheLoais { get; set; }

    public virtual DbSet<ThongBao> ThongBaos { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Name=DefaultConnection");


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BaoCao>(entity =>
        {
            entity.HasKey(e => e.MaBc).HasName("PK__BaoCao__272475A621015EC8");

            entity.ToTable("BaoCao");

            entity.Property(e => e.MaBc).HasColumnName("MaBC");
            entity.Property(e => e.LinkFile).HasMaxLength(255);
            entity.Property(e => e.LoaiBc)
                .HasMaxLength(50)
                .HasColumnName("LoaiBC");
            entity.Property(e => e.MaNv).HasColumnName("MaNV");
            entity.Property(e => e.NgayLap)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.MaNvNavigation).WithMany(p => p.BaoCaos)
                .HasForeignKey(d => d.MaNv)
                .HasConstraintName("FK__BaoCao__MaNV__02084FDA");
        });

        modelBuilder.Entity<ChiTietPhieuMuon>(entity =>
        {
            entity.HasKey(e => new { e.MaPm, e.MaVach }).HasName("PK__ChiTietP__EF9E135EE5E59A94");

            entity.ToTable("ChiTietPhieuMuon");

            entity.Property(e => e.MaPm).HasColumnName("MaPM");
            entity.Property(e => e.MaVach).HasMaxLength(50);

            entity.HasOne(d => d.MaPmNavigation).WithMany(p => p.ChiTietPhieuMuons)
                .HasForeignKey(d => d.MaPm)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChiTietPhi__MaPM__6D0D32F4");

            entity.HasOne(d => d.MaVachNavigation).WithMany(p => p.ChiTietPhieuMuons)
                .HasForeignKey(d => d.MaVach)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChiTietPh__MaVac__6E01572D");
        });

        modelBuilder.Entity<CuonSach>(entity =>
        {
            entity.HasKey(e => e.MaVach).HasName("PK__CuonSach__8BBF4A1D44CA9392");

            entity.ToTable("CuonSach");

            entity.Property(e => e.MaVach).HasMaxLength(50);
            entity.Property(e => e.TinhTrang)
                .HasMaxLength(50)
                .HasDefaultValue("Tot");

            entity.HasOne(d => d.MaSachNavigation).WithMany(p => p.CuonSaches)
                .HasForeignKey(d => d.MaSach)
                .HasConstraintName("FK__CuonSach__MaSach__656C112C");
        });

        modelBuilder.Entity<DanhGiaSach>(entity =>
        {
            entity.HasKey(e => new { e.MaDg, e.MaSach }).HasName("PK__DanhGiaS__EC06D1220E6A4481");

            entity.ToTable("DanhGiaSach");

            entity.Property(e => e.MaDg).HasColumnName("MaDG");
            entity.Property(e => e.BinhLuan).HasMaxLength(500);
            entity.Property(e => e.NgayDg)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("NgayDG");

            entity.HasOne(d => d.MaDgNavigation).WithMany(p => p.DanhGiaSaches)
                .HasForeignKey(d => d.MaDg)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DanhGiaSac__MaDG__778AC167");

            entity.HasOne(d => d.MaSachNavigation).WithMany(p => p.DanhGiaSaches)
                .HasForeignKey(d => d.MaSach)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DanhGiaSa__MaSac__787EE5A0");
        });

        modelBuilder.Entity<DatTruoc>(entity =>
        {
            entity.HasKey(e => e.MaDat).HasName("PK__DatTruoc__3D88833093236C40");

            entity.ToTable("DatTruoc");

            entity.Property(e => e.MaDg).HasColumnName("MaDG");
            entity.Property(e => e.NgayDat).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TrangThai).HasMaxLength(20);

            entity.HasOne(d => d.MaDgNavigation).WithMany(p => p.DatTruocs)
                .HasForeignKey(d => d.MaDg)
                .HasConstraintName("FK__DatTruoc__MaDG__7D439ABD");

            entity.HasOne(d => d.MaSachNavigation).WithMany(p => p.DatTruocs)
                .HasForeignKey(d => d.MaSach)
                .HasConstraintName("FK__DatTruoc__MaSach__7E37BEF6");
        });

        modelBuilder.Entity<DocGium>(entity =>
        {
            entity.HasKey(e => e.MaDg).HasName("PK__DocGia__27258660D04B44F8");

            entity.HasIndex(e => e.MaTk, "UQ__DocGia__27250071F4903964").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__DocGia__A9D10534C7739E2E").IsUnique();

            entity.Property(e => e.MaDg).HasColumnName("MaDG");
            entity.Property(e => e.DiaChi).HasMaxLength(255);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.HoTen).HasMaxLength(100);
            entity.Property(e => e.MaTk).HasColumnName("MaTK");
            entity.Property(e => e.SoDt)
                .HasMaxLength(20)
                .HasColumnName("SoDT");

            entity.HasOne(d => d.MaTkNavigation).WithOne(p => p.DocGium)
                .HasForeignKey<DocGium>(d => d.MaTk)
                .HasConstraintName("FK__DocGia__MaTK__5070F446");
        });

        modelBuilder.Entity<LichSuCapNhatTaiKhoan>(entity =>
        {
            entity.HasKey(e => e.MaLs).HasName("PK__LichSuCa__2725C77261998A1A");

            entity.ToTable("LichSuCapNhatTaiKhoan");

            entity.Property(e => e.MaLs).HasColumnName("MaLS");
            entity.Property(e => e.HanhDong).HasMaxLength(255);
            entity.Property(e => e.MaTk).HasColumnName("MaTK");
            entity.Property(e => e.ThoiGian)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.MaTkNavigation).WithMany(p => p.LichSuCapNhatTaiKhoans)
                .HasForeignKey(d => d.MaTk)
                .HasConstraintName("FK__LichSuCapN__MaTK__0D7A0286");
        });

        modelBuilder.Entity<LichSuDangNhap>(entity =>
        {
            entity.HasKey(e => e.MaLs).HasName("PK__LichSuDa__2725C7728ED67F60");

            entity.ToTable("LichSuDangNhap");

            entity.Property(e => e.MaLs).HasColumnName("MaLS");
            entity.Property(e => e.DiaChiIp)
                .HasMaxLength(50)
                .HasColumnName("DiaChiIP");
            entity.Property(e => e.MaTk).HasColumnName("MaTK");
            entity.Property(e => e.ThoiGian)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.MaTkNavigation).WithMany(p => p.LichSuDangNhaps)
                .HasForeignKey(d => d.MaTk)
                .HasConstraintName("FK__LichSuDang__MaTK__114A936A");
        });

        modelBuilder.Entity<NhanVien>(entity =>
        {
            entity.HasKey(e => e.MaNv).HasName("PK__NhanVien__2725D70A6DDD3224");

            entity.ToTable("NhanVien");

            entity.HasIndex(e => e.MaTk, "UQ__NhanVien__272500715B32BBF1").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__NhanVien__A9D10534D1674923").IsUnique();

            entity.Property(e => e.MaNv).HasColumnName("MaNV");
            entity.Property(e => e.ChucVu).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.HoTen).HasMaxLength(100);
            entity.Property(e => e.MaTk).HasColumnName("MaTK");
            entity.Property(e => e.SoDt)
                .HasMaxLength(20)
                .HasColumnName("SoDT");

            entity.HasOne(d => d.MaTkNavigation).WithOne(p => p.NhanVien)
                .HasForeignKey<NhanVien>(d => d.MaTk)
                .HasConstraintName("FK__NhanVien__MaTK__5535A963");
        });

        modelBuilder.Entity<PhieuMuon>(entity =>
        {
            entity.HasKey(e => e.MaPm).HasName("PK__PhieuMuo__2725E7FF0F04A3B6");

            entity.ToTable("PhieuMuon");

            entity.Property(e => e.MaPm).HasColumnName("MaPM");
            entity.Property(e => e.MaDg).HasColumnName("MaDG");
            entity.Property(e => e.MaNv).HasColumnName("MaNV");
            entity.Property(e => e.NgayMuon).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MaDgNavigation).WithMany(p => p.PhieuMuons)
                .HasForeignKey(d => d.MaDg)
                .HasConstraintName("FK__PhieuMuon__MaDG__693CA210");

            entity.HasOne(d => d.MaNvNavigation).WithMany(p => p.PhieuMuons)
                .HasForeignKey(d => d.MaNv)
                .HasConstraintName("FK__PhieuMuon__MaNV__6A30C649");
        });

        modelBuilder.Entity<PhieuPhat>(entity =>
        {
            entity.HasKey(e => e.MaPp).HasName("PK__PhieuPha__2725E7F252157E48");

            entity.ToTable("PhieuPhat");

            entity.Property(e => e.MaPp).HasColumnName("MaPP");
            entity.Property(e => e.LyDo).HasMaxLength(255);
            entity.Property(e => e.MaPm).HasColumnName("MaPM");
            entity.Property(e => e.NgayPhat).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.SoTien).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(20)
                .HasDefaultValue("ChuaDong");

            entity.HasOne(d => d.MaPmNavigation).WithMany(p => p.PhieuPhats)
                .HasForeignKey(d => d.MaPm)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PhieuPhat__MaPM__72C60C4A");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.MaToken).HasName("PK__RefreshT__C30F950E1C55D32A");

            entity.ToTable("RefreshToken");

            entity.Property(e => e.ExpiryDate).HasColumnType("datetime");
            entity.Property(e => e.IsRevoked).HasDefaultValue(false);
            entity.Property(e => e.MaTk).HasColumnName("MaTK");
            entity.Property(e => e.Token).HasMaxLength(255);

            entity.HasOne(d => d.MaTkNavigation).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.MaTk)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RefreshTok__MaTK__09A971A2");
        });

        modelBuilder.Entity<Sach>(entity =>
        {
            entity.HasKey(e => e.MaSach).HasName("PK__Sach__B235742D19105DCB");

            entity.ToTable("Sach");

            entity.Property(e => e.MaSach).ValueGeneratedNever();
            entity.Property(e => e.MaTl)
                .HasMaxLength(50)
                .HasColumnName("MaTL");
            entity.Property(e => e.NamXb).HasColumnName("NamXB");
            entity.Property(e => e.NhaXb)
                .HasMaxLength(100)
                .HasColumnName("NhaXB");
            entity.Property(e => e.SoLuong).HasDefaultValue(1);
            entity.Property(e => e.TuaSach).HasMaxLength(255);

            entity.HasOne(d => d.MaTlNavigation)
                .WithMany(p => p.Saches)
                .HasForeignKey(d => d.MaTl)
                .HasConstraintName("FK__Sach__MaTL__5CD6CB2B");

            // 💡 Giữ cấu hình many-to-many nhưng không dùng entity SachTacGium nữa
            entity.HasMany(d => d.TacGia)
                .WithMany(p => p.MaSaches)
                .UsingEntity<Dictionary<string, object>>(
                    "Sach_TacGia",
                    r => r.HasOne<TacGium>().WithMany()
                        .HasForeignKey("MaTG")
                        .OnDelete(DeleteBehavior.Cascade),
                    l => l.HasOne<Sach>().WithMany()
                        .HasForeignKey("MaSach")
                        .OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.HasKey("MaSach", "MaTG");
                        j.ToTable("Sach_TacGia");
                    });
        });

        
        

        modelBuilder.Entity<TacGium>(entity =>
        {
            entity.HasKey(e => e.MaTg).HasName("PK__TacGia__27250074E050E20B");

            entity.Property(e => e.MaTg)
                .HasMaxLength(50)
                .HasColumnName("MaTG");
            entity.Property(e => e.TenTg)
                .HasMaxLength(100)
                .HasColumnName("TenTG");
        });

        modelBuilder.Entity<TaiKhoan>(entity =>
        {
            entity.HasKey(e => e.MaTk).HasName("PK__TaiKhoan__27250070CDD631D1");

            entity.ToTable("TaiKhoan");

            entity.HasIndex(e => e.TenDangNhap, "UQ__TaiKhoan__55F68FC091308058").IsUnique();

            entity.Property(e => e.MaTk).HasColumnName("MaTK");
            entity.Property(e => e.LastActive).HasColumnType("datetime");
            entity.Property(e => e.MatKhau).HasMaxLength(255);
            entity.Property(e => e.TenDangNhap).HasMaxLength(50);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
            entity.Property(e => e.VaiTro).HasMaxLength(20);
        });

        modelBuilder.Entity<TheLoai>(entity =>
        {
            entity.HasKey(e => e.MaTl).HasName("PK__TheLoai__272500719EF45733");

            entity.ToTable("TheLoai");

            entity.Property(e => e.MaTl)
                .HasMaxLength(50)
                .HasColumnName("MaTL");
            entity.Property(e => e.TenTl)
                .HasMaxLength(100)
                .HasColumnName("TenTL");
        });

        modelBuilder.Entity<ThongBao>(entity =>
        {
            entity.HasKey(e => e.MaTb).HasName("PK__ThongBao__2725006F61B690F1");

            entity.ToTable("ThongBao");

            entity.Property(e => e.MaTb).HasColumnName("MaTB");
            entity.Property(e => e.MaTk).HasColumnName("MaTK");
            entity.Property(e => e.NgayTb)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("NgayTB");
            entity.Property(e => e.NoiDung).HasMaxLength(500);

            entity.HasOne(d => d.MaTkNavigation).WithMany(p => p.ThongBaos)
                .HasForeignKey(d => d.MaTk)
                .HasConstraintName("FK__ThongBao__MaTK__05D8E0BE");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
