# RiceGuard AI — Model Training & Dataset Pipeline

## 1. Supported Rice Pathology Classes (10 classes)

1. `healthy`
2. `rice_blast`
3. `bacterial_leaf_blight`
4. `brown_spot`
5. `leaf_smut`
6. `tungro`
7. `sheath_blight`
8. `false_smut`
9. `sheath_rot`
10. `unknown` (Non-rice, non-foliage, or unidentifiable anomaly)

## 2. Recommended Curated Datasets

- **Kaggle Rice Leaf Diseases Dataset**
- **Mendeley Rice Leaf Pathology Collection**
- **ICAR-NRRI Cuttack Reference Images**

## 3. Training Workflow

### Step 1: Split & Validate Hierarchy
```bash
python training/scripts/prepare_dataset.py
```
This distributes images across `train/`, `val/`, and `test/` splits (70/15/15 ratio) in `dataset/processed/`.

### Step 2: Run Training
```bash
python training/scripts/train.py --epochs 25 --batch_size 32 --lr 0.001
```
The script applies biologically valid leaf augmentations (subtle rotations, slight brightness variation, horizontal flipping) without creating unrealistic distortions.

### Step 3: Evaluate Test Metrics
```bash
python training/scripts/evaluate.py
```
Calculates overall test accuracy, per-class Precision, Recall, and F1 scores.

### Step 4: Plug Model into Backend
Update your `.env` file:
```env
DEMO_MODE=false
MODEL_PATH="./models/best_rice_model.pt"
```
Restart the backend service. The application automatically detects and serves predictions from the trained model while keeping the frontend interface unchanged.
