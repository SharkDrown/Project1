import json
import requests
from tqdm import tqdm

OLLAMA_URL = "http://localhost:11434/api/embeddings"
MODEL = "nomic-embed-text"
INPUT_FILE = "rule.json"
OUTPUT_FILE = "embedding_rule.json"

# Hàm flatten JSON thành các chunk text
def flatten_rules(rules_json):
    chunks = []
    rule_id = 1

    for chuong in rules_json.get("chuong", []):
        maChuong = chuong.get("maChuong")
        tenChuong = chuong.get("tenChuong")

        for muc in chuong.get("muc", []):
            maMuc = muc.get("maMuc")
            tenMuc = muc.get("tenMuc")

            for dieu in muc.get("dieu", []):
                soDieu = dieu.get("soDieu")
                tenDieu = dieu.get("tenDieu", "")
                noiDungDieu = dieu.get("noiDung", "")

                # Nếu điều có 'khoan'
                if "khoan" in dieu:
                    for khoan in dieu["khoan"]:
                        soKhoan = khoan.get("soKhoan")
                        noiDungKhoan = khoan.get("noiDung", "")
                        # Nếu có 'diem' trong khoản
                        if "diem" in khoan:
                            for diem in khoan["diem"]:
                                kyHieu = diem.get("kyHieu")
                                noiDungDiem = diem.get("noiDung", "")
                                chunk_text = f"{tenChuong} / {tenMuc} / {tenDieu} / Khoan {soKhoan}{kyHieu}: {noiDungDiem}"
                                chunks.append({"id": f"RULE_{rule_id}", "text": chunk_text})
                                rule_id += 1
                        else:
                            chunk_text = f"{tenChuong} / {tenMuc} / {tenDieu} / Khoan {soKhoan}: {noiDungKhoan}"
                            chunks.append({"id": f"RULE_{rule_id}", "text": chunk_text})
                            rule_id += 1
                else:
                    # Điều không có khoản
                    chunk_text = f"{tenChuong} / {tenMuc} / {tenDieu}: {noiDungDieu}"
                    chunks.append({"id": f"RULE_{rule_id}", "text": chunk_text})
                    rule_id += 1
    return chunks

# 🔹 Load JSON quy định
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    rules_json = json.load(f)

chunks = flatten_rules(rules_json)

# 🔹 Tạo embedding cho từng chunk
embedded_chunks = []
for chunk in tqdm(chunks, desc="Embedding rules"):
    response = requests.post(
        OLLAMA_URL,
        json={"model": MODEL, "prompt": chunk["text"]}
    )

    if response.status_code != 200:
        print(f"❌ Lỗi embedding {chunk['id']}")
        continue

    vector = response.json().get("embedding")
    embedded_chunks.append({
        "id": chunk["id"],
        "text": chunk["text"],
        "embedding": vector
    })

# 🔹 Lưu kết quả
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(embedded_chunks, f, ensure_ascii=False, indent=2)

print("✅ Đã tạo embedding_rules.json thành công")
