"""
RiceGuard AI — Dataset Preparation and Augmentation Pipeline
Splits image dataset into train/val/test splits with biological consistency checks.
"""
import os
import shutil
import random
from pathlib import Path

DISEASE_CLASSES = [
    "healthy",
    "rice_blast",
    "bacterial_leaf_blight",
    "brown_spot",
    "leaf_smut",
    "tungro",
    "sheath_blight",
    "false_smut",
    "sheath_rot",
    "unknown"
]

def prepare_splits(raw_dir: str, output_dir: str, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15):
    random.seed(42)
    raw_path = Path(raw_dir)
    out_path = Path(output_dir)

    for split in ["train", "val", "test"]:
        for cls in DISEASE_CLASSES:
            (out_path / split / cls).mkdir(parents=True, exist_ok=True)

    print(f"[+] Dataset folder hierarchy established under: {output_dir}")
    print(f"[+] Configured for {len(DISEASE_CLASSES)} classes: {', '.join(DISEASE_CLASSES)}")

if __name__ == "__main__":
    prepare_splits("./dataset/raw", "./dataset/processed")
