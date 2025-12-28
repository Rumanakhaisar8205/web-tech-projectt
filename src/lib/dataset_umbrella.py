from PIL import Image
import os

INPUT_DIR = "C:\Users\Admin7\OneDrive\Documents\umbrella"
OUTPUT_DIR = "processed/umbrella"
TARGET_SIZE = 224

os.makedirs(OUTPUT_DIR, exist_ok=True)

def resize_with_padding(img, size):
    w, h = img.size
    scale = size / max(w, h)
    nw, nh = int(w * scale), int(h * scale)
    img = img.resize((nw, nh), Image.BICUBIC)

    bg = Image.new("RGB", (size, size), (255, 255, 255))
    bg.paste(img, ((size - nw) // 2, (size - nh) // 2))
    return bg


valid_ext = (".jpg", ".jpeg", ".png", ".webp")

for f in os.listdir(INPUT_DIR):
    if f.lower().endswith(valid_ext):
        img = Image.open(os.path.join(INPUT_DIR, f)).convert("RGB")
        out = resize_with_padding(img, TARGET_SIZE)

        # 🔹 THIS converts the extension
        new_name = os.path.splitext(f)[0] + ".jpg"
        out.save(os.path.join(OUTPUT_DIR, new_name), "JPEG", quality=95)

print("✅ All images converted to JPG and resized to 224×224.")
