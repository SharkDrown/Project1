import json
import asyncio
from googletrans import Translator
from tqdm import tqdm

INPUT_FILE = "books.json"
OUTPUT_FILE = "books_translated.json"

async def main():
    translator = Translator()

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    for item in tqdm(data, desc="Translating"):
        if "content_vi" in item:
            vi_text = item["content_vi"]
            result = await translator.translate(vi_text, src="vi", dest="en")
            item["content_en"] = result.text

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("✅ Done! Saved to", OUTPUT_FILE)

asyncio.run(main())
