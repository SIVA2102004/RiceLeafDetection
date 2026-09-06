"""
RiceGuard AI — Model Evaluation & Metric Generator
Computes Accuracy, Precision, Recall, F1-score and prints Confusion Matrix on held-out test data.
"""

import os
import argparse
import json
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from training.scripts.train import build_model

def evaluate(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    meta_file = os.path.join(args.model_dir, "model_metadata.json")
    weights_file = os.path.join(args.model_dir, "best_rice_model.pt")

    if not os.path.exists(meta_file) or not os.path.exists(weights_file):
        print("[!] Model checkpoint or metadata not found. Train model first.")
        return

    with open(meta_file) as f:
        meta = json.load(f)

    class_names = meta["classes"]
    num_classes = len(class_names)

    model = build_model(num_classes=num_classes, pretrained=False)
    model.load_state_dict(torch.load(weights_file, map_location=device))
    model.to(device)
    model.eval()

    test_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    test_path = os.path.join(args.data_dir, "test")
    if not os.path.exists(test_path):
        print(f"[!] Test dataset directory not found at {test_path}")
        return

    test_dataset = datasets.ImageFolder(test_path, transform=test_transforms)
    test_loader = DataLoader(test_dataset, batch_size=args.batch_size, shuffle=False)

    all_preds = []
    all_targets = []

    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(labels.cpu().numpy())

    # Calculate metrics
    correct = sum(p == t for p, t in zip(all_preds, all_targets))
    total = len(all_targets)
    accuracy = correct / total if total > 0 else 0.0

    print("=========================================")
    print(f"RICEGUARD AI MODEL EVALUATION REPORT")
    print(f"Architecture: {meta['architecture']}")
    print(f"Total Test Samples: {total}")
    print(f"Overall Test Accuracy: {accuracy * 100:.2f}%")
    print("=========================================")

    # Per-class metrics
    for idx, cname in enumerate(class_names):
        tp = sum(p == idx and t == idx for p, t in zip(all_preds, all_targets))
        fp = sum(p == idx and t != idx for p, t in zip(all_preds, all_targets))
        fn = sum(p != idx and t == idx for p, t in zip(all_preds, all_targets))

        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
        print(f"Class: {cname.ljust(24)} | Prec: {prec:.3f} | Rec: {rec:.3f} | F1: {f1:.3f}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate Rice Disease Model")
    parser.add_argument("--data_dir", type=str, default="./dataset/processed")
    parser.add_argument("--model_dir", type=str, default="./models")
    parser.add_argument("--batch_size", type=int, default=32)
    args = parser.parse_args()
    evaluate(args)
