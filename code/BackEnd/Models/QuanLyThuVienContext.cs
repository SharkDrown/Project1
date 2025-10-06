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

    public virtual DbSet<Sach> Saches { get; set; }

    public virtual DbSet<TacGium> TacGia { get; set; }

    public virtual DbSet<TaiKhoan> TaiKhoans { get; set; }

    public virtual DbSet<TheLoai> TheLoais { get; set; }

    public virtual DbSet<ThongBao> ThongBaos { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=LAPTOP-HUNGVIET\\SQLEXPRESS;Database=QuanLyThuVien;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BaoCao>(entity =>
        {
            entity.HasKey(e => e.MaBc).HasName("PK__BaoCao__272475A69409E228");

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
                .HasConstraintName("FK__BaoCao__MaNV__05D8E0BE");
        });

        modelBuilder.Entity<ChiTietPhieuMuon>(entity =>
        {
            entity.HasKey(e => new { e.MaPm, e.MaVach }).HasName("PK__ChiTietP__EF9E135EF3863BE9");

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
            entity.HasKey(e => e.MaVach).HasName("PK__CuonSach__8BBF4A1D37657059");

            entity.ToTable("CuonSach");

            entity.Property(e => e.MaVach).HasMaxLength(50);
            entity.Property(e => e.TinhTrang)
                .HasMaxLength(50)
                .HasDefaultValue("Tot");

            entity.HasOne(d => d.MaSachNavigation).WithMany(p => p.CuonSaches)
                .HasForeignKey(d => d.MaSach)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CuonSach__MaSach__6A30C649");
        });

        modelBuilder.Entity<DanhGiaSach>(entity =>
        {
            entity.HasKey(e => new { e.MaDg, e.MaSach }).HasName("PK__DanhGiaS__EC06D1227C0E54F5");

            entity.ToTable("DanhGiaSach");

            entity.Property(e => e.MaDg).HasColumnName("MaDG");
            entity.Property(e => e.BinhLuan).HasMaxLength(500);
            entity.Property(e => e.NgayDg)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("NgayDG");

            entity.HasOne(d => d.MaDgNavigation).WithMany(p => p.DanhGiaSaches)
                .HasForeignKey(d => d.MaDg)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DanhGiaSac__MaDG__7D439ABD");

            entity.HasOne(d => d.MaSachNavigation).WithMany(p => p.DanhGiaSaches)
                .HasForeignKey(d => d.MaSach)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DanhGiaSa__MaSac__7E37BEF6");
        });

        modelBuilder.Entity<DatTruoc>(entity =>
        {
            entity.HasKey(e => e.MaDat).HasName("PK__DatTruoc__3D8883307D4CF2CE");

            entity.ToTable("DatTruoc");

            entity.Property(e => e.MaDg).HasColumnName("MaDG");
            entity.Property(e => e.NgayDat).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TrangThai).HasMaxLength(20);

            entity.HasOne(d => d.MaDgNavigation).WithMany(p => p.DatTruocs)
                .HasForeignKey(d => d.MaDg)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DatTruoc__MaDG__778AC167");

            entity.HasOne(d => d.MaSachNavigation).WithMany(p => p.DatTruocs)
                .HasForeignKey(d => d.MaSach)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DatTruoc__MaSach__787EE5A0");
        });

        modelBuilder.Entity<DocGium>(entity =>
        {
            entity.HasKey(e => e.MaDg).HasName("PK__DocGia__27258660FC228268");

            entity.HasIndex(e => e.MaTk, "UQ__DocGia__27250071F895B9AE").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__DocGia__A9D10534304541A3").IsUnique();

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
            entity.HasKey(e => e.MaLs).HasName("PK__LichSuCa__2725C772CEE378A0");

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
            entity.HasKey(e => e.MaLs).HasName("PK__LichSuDa__2725C772616B7D0C");

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
                .HasConstraintName("FK__LichSuDang__MaTK__09A971A2");
        });

        modelBuilder.Entity<NhanVien>(entity =>
        {
            entity.HasKey(e => e.MaNv).HasName("PK__NhanVien__2725D70AA353538E");

            entity.ToTable("NhanVien");

            entity.HasIndex(e => e.MaTk, "UQ__NhanVien__27250071C7D5D737").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__NhanVien__A9D1053457A97A8A").IsUnique();

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
            entity.HasKey(e => e.MaPm).HasName("PK__PhieuMuo__2725E7FF4BD82FB4");

            entity.ToTable("PhieuMuon");

            entity.Property(e => e.MaPm).HasColumnName("MaPM");
            entity.Property(e => e.MaDg).HasColumnName("MaDG");
            entity.Property(e => e.MaNv).HasColumnName("MaNV");
            entity.Property(e => e.NgayMuon).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MaDgNavigation).WithMany(p => p.PhieuMuons)
                .HasForeignKey(d => d.MaDg)
                .HasConstraintName("FK__PhieuMuon__MaDG__6477ECF3");

            entity.HasOne(d => d.MaNvNavigation).WithMany(p => p.PhieuMuons)
                .HasForeignKey(d => d.MaNv)
                .HasConstraintName("FK__PhieuMuon__MaNV__656C112C");
        });

        modelBuilder.Entity<PhieuPhat>(entity =>
        {
            entity.HasKey(e => e.MaPp).HasName("PK__PhieuPha__2725E7F298B077AC");

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

        modelBuilder.Entity<Sach>(entity =>
        {
            entity.HasKey(e => e.MaSach).HasName("PK__Sach__B235742D3E478EB0");

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

            entity.HasOne(d => d.MaTlNavigation).WithMany(p => p.Saches)
                .HasForeignKey(d => d.MaTl)
                .HasConstraintName("FK__Sach__MaTL__5CD6CB2B");

            entity.HasMany(d => d.MaTgs).WithMany(p => p.MaSaches)
                .UsingEntity<Dictionary<string, object>>(
                    "SachTacGium",
                    r => r.HasOne<TacGium>().WithMany()
                        .HasForeignKey("MaTg")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Sach_TacGi__MaTG__60A75C0F"),
                    l => l.HasOne<Sach>().WithMany()
                        .HasForeignKey("MaSach")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Sach_TacG__MaSac__5FB337D6"),
                    j =>
                    {
                        j.HasKey("MaSach", "MaTg").HasName("PK__Sach_Tac__E047242ACCB0DF35");
                        j.ToTable("Sach_TacGia");
                        j.IndexerProperty<string>("MaTg")
                            .HasMaxLength(50)
                            .HasColumnName("MaTG");
                    });
        });

        modelBuilder.Entity<TacGium>(entity =>
        {
            entity.HasKey(e => e.MaTg).HasName("PK__TacGia__2725007407D2A4BF");

            entity.Property(e => e.MaTg)
                .HasMaxLength(50)
                .HasColumnName("MaTG");
            entity.Property(e => e.TenTg)
                .HasMaxLength(100)
                .HasColumnName("TenTG");
        });

        modelBuilder.Entity<TaiKhoan>(entity =>
        {
            entity.HasKey(e => e.MaTk).HasName("PK__TaiKhoan__27250070C2D8D503");

            entity.ToTable("TaiKhoan");

            entity.HasIndex(e => e.TenDangNhap, "UQ__TaiKhoan__55F68FC04DF40C8F").IsUnique();

            entity.Property(e => e.MaTk).HasColumnName("MaTK");
            entity.Property(e => e.MatKhau).HasMaxLength(255);
            entity.Property(e => e.TenDangNhap).HasMaxLength(50);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
            entity.Property(e => e.VaiTro).HasMaxLength(20);
        });

        modelBuilder.Entity<TheLoai>(entity =>
        {
            entity.HasKey(e => e.MaTl).HasName("PK__TheLoai__27250071BDA11A50");

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
            entity.HasKey(e => e.MaTb).HasName("PK__ThongBao__2725006F12668AFE");

            entity.ToTable("ThongBao");

            entity.Property(e => e.MaTb).HasColumnName("MaTB");
            entity.Property(e => e.MaTk).HasColumnName("MaTK");
            entity.Property(e => e.NgayTb)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("NgayTB");
            entity.Property(e => e.NoiDung).HasMaxLength(500);

            entity.HasOne(d => d.MaTkNavigation).WithMany(p => p.ThongBaos)
                .HasForeignKey(d => d.MaTk)
                .HasConstraintName("FK__ThongBao__MaTK__02084FDA");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
