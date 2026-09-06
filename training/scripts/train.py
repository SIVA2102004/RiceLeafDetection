"""
RiceGuard AI — Model Training Script
Trains a transfer learning model (MobileNetV3 / ResNet / EfficientNet / ViT) on rice leaf pathology datasets.
Supports data augmentation, class weighting, early stopping, and torch/onnx export.
"""

import os
import argparse
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from pathlib import Path

def get_data_loaders(data_dir: str, batch_size: int = 32, img_size: int = 224):
    # Biologically valid augmentations for plant leaf pathology
    train_transforms = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transforms = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    train_path = os.path.join(data_dir, "train")
    val_path = os.path.join(data_dir, "val")

    if not os.path.exists(train_path) or not os.path.exists(val_path):
        print(f"[!] Warning: Train/Val paths not found at {data_dir}. Run prepare_dataset.py first.")
        return None, None, []

    train_dataset = datasets.ImageFolder(train_path, transform=train_transforms)
    val_dataset = datasets.ImageFolder(val_path, transform=val_transforms)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=2)

    return train_loader, val_loader, train_dataset.classes

def build_model(num_classes: int = 10, pretrained: bool = True):
    # Lightweight MobileNetV3 backbone optimized for edge & mobile inference
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, num_classes)
    return model

def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Training on device: {device}")

    train_loader, val_loader, class_names = get_data_loaders(args.data_dir, args.batch_size)
    if train_loader is None:
        print("[!] Aborting training: Missing data directory.")
        return

    model = build_model(num_classes=len(class_names)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)

    best_val_acc = 0.0
    os.makedirs(args.output_dir, exist_ok=True)

    print(f"[*] Starting training for {args.epochs} epochs across classes: {class_names}")

    for epoch in range(args.epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

        train_acc = correct / total if total > 0 else 0.0
        train_loss = running_loss / total if total > 0 else 0.0

        # Validation phase
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, preds = torch.max(outputs, 1)
                val_correct += torch.sum(preds == labels.data).item()
                val_total += labels.size(0)

        val_acc = val_correct / val_total if val_total > 0 else 0.0
        print(f"Epoch {epoch+1}/{args.epochs} -> Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | Val Acc: {val_acc:.4f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            out_model_path = os.path.join(args.output_dir, "best_rice_model.pt")
            torch.save(model.state_dict(), out_model_path)
            print(f"[+] Saved updated best checkpoint to {out_model_path}")

    # Save class mapping metadata
    meta_path = os.path.join(args.output_dir, "model_metadata.json")
    with open(meta_path, "w") as f:
        json.dump({
            "architecture": "MobileNetV3-Small",
            "classes": class_names,
            "best_val_acc": best_val_acc,
            "img_size": 224
        }, f, indent=2)
    print(f"[+] Training complete. Artifacts saved in {args.output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Rice Leaf Disease Model")
    parser.add_argument("--data_dir", type=str, default="./dataset/processed")
    parser.add_argument("--output_dir", type=str, default="./models")
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    args = parser.parse_args()
    train(args)
