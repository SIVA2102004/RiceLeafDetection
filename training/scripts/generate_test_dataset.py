"""
RiceGuard AI — Dataset Download and Synthetic Benchmarker
Generates a structured test benchmark dataset across all user-specified rice pathology classes:
1. Bacterial Leaf Blight
2. Brown Spot
3. Healthy
4. Leaf Blast
5. Leaf Scald
6. Narrow Brown Spot
7. Neck Blast
8. Rice Hispa
9. Sheath Blight
10. Tungro
"""

import os
import argparse
from PIL import Image, ImageDraw

CLASSES = [
    "bacterial_leaf_blight",
    "brown_spot",
    "healthy",
    "leaf_blast",
    "leaf_scald",
    "narrow_brown_spot",
    "neck_blast",
    "rice_hispa",
    "sheath_blight",
    "tungro"
]

def generate_test_sample(cls: str, index: int, output_dir: str):
    img = Image.new("RGB", (128, 128), color=(34, 139, 34)) # base green leaf
    draw = ImageDraw.Draw(img)

    if cls == "healthy":
        # clean uniform green leaf with midrib
        draw.line([(64, 0), (64, 128)], fill=(46, 165, 60), width=2)
    elif cls == "bacterial_leaf_blight":
        # Yellowish-white wavy margin stripes
        draw.polygon([(0, 0), (35, 0), (45, 128), (0, 128)], fill=(225, 220, 120))
    elif cls == "brown_spot":
        # Scattered circular brown spots with yellow halos
        for offset in [(30, 30), (80, 50), (50, 90), (90, 100)]:
            draw.ellipse([offset[0]-8, offset[1]-8, offset[0]+8, offset[1]+8], fill=(210, 180, 50))
            draw.ellipse([offset[0]-4, offset[1]-4, offset[0]+4, offset[1]+4], fill=(101, 67, 33))
    elif cls == "leaf_blast":
        # Spindle-shaped lesion with grayish center and brown margin
        draw.ellipse([45, 40, 85, 90], fill=(139, 69, 19))
        draw.ellipse([55, 50, 75, 80], fill=(200, 200, 200))
    elif cls == "leaf_scald":
        # Alternating light tan and brown concentric bands
        draw.polygon([(0, 0), (128, 0), (80, 45), (45, 45)], fill=(215, 175, 105))
        draw.polygon([(45, 45), (80, 45), (70, 75), (55, 75)], fill=(130, 75, 40))
        draw.polygon([(55, 75), (70, 75), (65, 95), (60, 95)], fill=(215, 175, 105))
    elif cls == "narrow_brown_spot":
        # Short, narrow, linear reddish-brown lesions parallel to veins
        for x, y, l in [(35, 20, 25), (60, 50, 35), (85, 30, 20), (50, 85, 30), (75, 90, 25)]:
            draw.line([(x, y), (x, y + l)], fill=(120, 50, 25), width=2)
    elif cls == "neck_blast":
        # Necrotic black lesion at panicle neck node with empty grain stalks
        draw.rectangle([55, 45, 75, 80], fill=(40, 30, 25))
        draw.line([(65, 0), (65, 45)], fill=(205, 195, 150), width=3)
        draw.line([(65, 80), (65, 128)], fill=(46, 139, 46), width=3)
    elif cls == "rice_hispa":
        # Parallel white scraped streaks and blister blotches
        for x in [25, 45, 65, 85, 105]:
            draw.line([(x, 15), (x, 110)], fill=(240, 240, 235), width=2)
        draw.ellipse([50, 40, 78, 70], fill=(225, 225, 220))
    elif cls == "sheath_blight":
        # Irregular greenish-gray lesion with brown boundary
        draw.ellipse([30, 50, 100, 110], fill=(120, 80, 40))
        draw.ellipse([38, 58, 92, 102], fill=(160, 180, 150))
    elif cls == "tungro":
        # Orange-yellow chlorosis from leaf tip
        draw.polygon([(0, 0), (128, 0), (90, 80), (38, 80)], fill=(235, 150, 20))

    dest = os.path.join(output_dir, cls, f"{cls}_{index:05d}.jpg")
    img.save(dest, format="JPEG", quality=75)

def build_test_dataset(target_count: int, output_base: str):
    per_class = target_count // len(CLASSES)
    print(f"[*] Generating {target_count} benchmark test images (~{per_class} per class across {len(CLASSES)} classes)...")
    
    total = 0
    for cls in CLASSES:
        os.makedirs(os.path.join(output_base, cls), exist_ok=True)
        for i in range(per_class):
            generate_test_sample(cls, i, output_base)
            total += 1
            if total % 5000 == 0:
                print(f"    -> Generated {total}/{target_count} images...")

    print(f"[+] Finished generating {total} test images in '{output_base}'!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=30000, help="Number of test images to create")
    parser.add_argument("--output_dir", type=str, default="./dataset/test_dataset")
    args = parser.parse_args()
    build_test_dataset(args.count, args.output_dir)
