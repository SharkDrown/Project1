import pyodbc
import json

# 🔹 Kết nối SQL Server
conn = pyodbc.connect(
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=HOANG;"              # đổi nếu cần
    "DATABASE=QuanLyThuVien;"    # tên DB
    "Trusted_Connection=yes;"
)

cursor = conn.cursor()

# 🔹 Query sách + thể loại + tác giả
cursor.execute("""
    SELECT
        s.MaSach,
        s.TuaSach,
        s.NamXB,
        s.NhaXB,
        s.GioiThieu,
        tl.TenTL,
        STRING_AGG(tg.TenTG, ', ') AS TacGia
    FROM Sach s
    LEFT JOIN TheLoai tl ON s.MaTL = tl.MaTL
    LEFT JOIN Sach_TacGia stg ON s.MaSach = stg.MaSach
    LEFT JOIN TacGia tg ON stg.MaTG = tg.MaTG
    GROUP BY
        s.MaSach, s.TuaSach, s.NamXB, s.NhaXB, s.GioiThieu, tl.TenTL
""")

rows = cursor.fetchall()

books = []

for row in rows:
    (
        ma_sach,
        tua_sach,
        nam_xb,
        nha_xb,
        gioi_thieu,
        ten_tl,
        tac_gia
    ) = row

    # 🔥 Content dùng cho embedding
    content = f"""
    Tựa sách: {tua_sach}
    Tác giả: {tac_gia or 'Không rõ'}
    Thể loại: {ten_tl or 'Không rõ'}
    Nhà xuất bản: {nha_xb or 'Không rõ'}
    Năm xuất bản: {nam_xb or 'Không rõ'}
    Giới thiệu: {gioi_thieu or 'Không có mô tả'}
    """.strip()

    books.append({
        "id": f"BOOK_{ma_sach}",
        "type": "book_meta",
        "maSach": ma_sach,
        "content": content
    })

# 🔹 Ghi ra file JSON
with open("books.json", "w", encoding="utf-8") as f:
    json.dump(books, f, ensure_ascii=False, indent=2)

print("✅ Xuất books.json thành công")
