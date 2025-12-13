import json
import requests
from tqdm import tqdm
import re

# -----------------------
# Cấu hình Ollama
# -----------------------
OLLAMA_URL = "http://localhost:11434/api/embeddings"
MODEL = "nomic-embed-text"

# -----------------------
# Load file sách
# -----------------------
with open("books.json", "r", encoding="utf-8") as f:
    books = json.load(f)

embedded_chunks = []

# -----------------------
# Tạo embedding theo từng trường
# -----------------------
fields = ["Book title", "Author", "Genre", "Publisher", "Year of publication", "Introduction"]

for book in tqdm(books, desc="Processing books"):
    for idx, field in enumerate(fields, start=1):
        # Regex để lấy nội dung từng field
        pattern = rf"{field}:(.*?)(?=(?:{'|'.join(fields)}:)|$)"
        match = re.search(pattern, book["content_en"])
        if match:
            content_en = f"{field}:{match.group(1).strip()}"
        else:
            continue  # nếu không tìm thấy field, bỏ qua

        # Gửi yêu cầu tạo embedding
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": content_en
            }
        )

        if response.status_code != 200:
            print(f"❌ Lỗi embedding sách {book['id']} field {field}")
            continue

        vector = response.json().get("embedding", [])

        embedded_chunks.append({
            "id": f"{book['id']}_FIELD_{idx}",
            "maSach": book["maSach"],
            "type": book["type"],
            "field": field,
            "content_en": content_en,
            "content_vi": book.get("content_vi", ""),
            "embedding": vector
        })

# -----------------------
# Ghi ra file json
# -----------------------
with open("embedding_books.json", "w", encoding="utf-8") as f:
    json.dump(embedded_chunks, f, ensure_ascii=False, indent=2)

print("✅ Đã tạo embedding_books_fields.json thành công")
