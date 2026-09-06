# RiceGuard AI: Comprehensive Project Documentation & Technical Report

---

## 1. Executive Summary & Project Overview

### 1.1 Project Vision
**RiceGuard AI** (RiceLeafDetection) is a production-grade, AI-driven, multilingual agricultural diagnostic platform designed specifically for rice farmers, agricultural extension workers, and agronomists. Rice (*Oryza sativa*) is the primary staple food for more than half of the global population, and premature disease detection is crucial to food security, crop yield protection, and responsible agrochemical usage.

### 1.2 Core Problem Statement
Farmers in rural areas face several severe hurdles:
- **Delayed Diagnosis**: Visual inspection by human experts takes days or weeks, allowing pathogenic outbreaks to destroy crops.
- **Language & Literacy Barriers**: Most agricultural apps operate exclusively in English, isolating regional farmers.
- **Over/Misuse of Agrochemicals**: Misidentifying a bacterial disease (e.g., Bacterial Leaf Blight) as a fungal infection (e.g., Blast) leads to ineffective fungicide use, wasting farmer capital and poisoning the local ecosystem.
- **Connectivity & Device Constraints**: Farmers frequently operate low-spec mobile devices in remote rural areas with intermittent connectivity.

### 1.3 Solution Architecture
RiceGuard AI solves this with:
1. **Computer Vision Disease Classification**: Real-time identification of 10 major rice leaf conditions with confidence scores and severity indicators.
2. **End-to-End Multilingual Support**: Complete localization in **7 Indian languages** (English, Telugu, Hindi, Tamil, Kannada, Marathi, Gujarati) with integrated Web Speech Text-to-Speech (TTS) and Speech-to-Text (STT).
3. **Actionable Treatment & Precaution Guidelines**: Detailed chemical, biological, and cultural management strategies for each detected condition.
4. **Interactive AI Farmer Assistant (RAG Chatbot)**: Conversational Q&A that automatically grounds answers on the farmer's latest diagnosis and verified agricultural knowledge.
5. **Modern Cloud Deployment**: Fully decoupled architecture with a FastAPI backend hosted on Render and a high-performance Next.js 16 frontend hosted on Vercel.

---

## 2. Supported Disease Classes & Agronomic Knowledge

RiceGuard AI classifies and provides treatment regimes for **10 major conditions**:

| # | Disease / Condition | Pathogen Type | Scientific Name / Agent | Visual Characteristics |
|---|---|---|---|---|
| 1 | **Bacterial Leaf Blight** | Bacteria | *Xanthomonas oryzae* pv. *oryzae* | Water-soaked to yellow-orange stripes along leaf margins, wavy edges, leaf wilting |
| 2 | **Brown Spot** | Fungus | *Bipolaris oryzae* (*Cochliobolus miyabeanus*) | Oval to circular brown spots with grey or whitish centres and yellow halos |
| 3 | **Healthy Rice** | N/A | Normal Foliage | Uniform vibrant green leaves, absence of chlorosis, necrosis, or lesions |
| 4 | **Leaf Blast** | Fungus | *Magnaporthe oryzae* (*Pyricularia oryzae*) | Diamond- or spindle-shaped lesions with gray centers and dark brownish-red margins |
| 5 | **Leaf Scald** | Fungus | *Microdochium oryzae* | Zonate lesions from leaf tips or edges, chevron/alternating light and dark brown bands |
| 6 | **Narrow Brown Spot** | Fungus | *Cercospora janseana* | Short, linear, narrow dark brown lesions parallel to leaf veins |
| 7 | **Neck Blast** | Fungus | *Magnaporthe oryzae* | Lesions at the panicle neck node, causing grayish-brown rot and severe lodging/grain sterility |
| 8 | **Rice Hispa** | Insect Pest | *Dicladispa armigera* | White parallel streaks where leaf tissue is scraped away, giving fields a withered, white appearance |
| 9 | **Sheath Blight** | Fungus | *Rhizoctonia solani* | Oval greenish-gray water-soaked lesions on leaf sheaths near water line, progressing upward |
| 10 | **Tungro** | Virus Complex | RTBV + RTSV (vectored by Green Leafhopper) | Stunted plant growth, yellow-to-orange leaf discoloration, reduced tillering |
| 11 | **Unknown / Non-Rice** | Out-of-Distribution | Generic / Foreign foliage | Fallback category for low-confidence or non-rice foliage images |

---

## 3. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                                  USER CLIENT                                      |
|    Mobile Browser / Desktop / Field Tablet (Camera Viewfinder & Audio Mic)        |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS
                                          v
+-----------------------------------------------------------------------------------+
|                        FRONTEND LAYER (Vercel Edge Network)                       |
|  - Next.js 16 (App Router) + React 19 + TypeScript                                |
|  - Tailwind CSS + Lucide Icons + Framer Motion                                   |
|  - Custom Multilingual Engine (7 regional language locale catalogs)               |
|  - Web Speech API (Hands-free Voice Input & Audio Guidance)                       |
|  - Live Viewfinder / Canvas Pre-processor (Blur, Brightness, Crop checks)         |
+-----------------------------------------+-----------------------------------------+
                                          | REST API (JSON / FormData)
                                          v
+-----------------------------------------------------------------------------------+
|                         BACKEND LAYER (Render Cloud / Linux)                      |
|  - FastAPI (Python 3.10 / 3.11) + Uvicorn ASGI Server                             |
|  - Pydantic v2 Settings & Schema Validation                                       |
|  - SQLAlchemy 2.0 ORM + SQLite / PostgreSQL database                              |
|  - Deep Learning Engine (PyTorch / Torchvision / EfficientNet-B0 / MobileNetV3)   |
|  - Image Processing Pipeline (Pillow, OpenCV, NumPy)                              |
|  - Rule-Based / RAG Context Knowledge Retrieval Engine                            |
+-----------------------------------------+-----------------------------------------+
                                          | Persistence
                                          v
+-----------------------------------------------------------------------------------+
|                               DATA & ASSET STORAGE                                |
|  - SQLite (riceguard.db) containing Diseases, Scan History, Farmer Profiles       |
|  - Trained Model Artifacts (weights.pth, labels.json)                             |
|  - Processed Upload Directory (/backend/uploads/)                                 |
+-----------------------------------------+-----------------------------------------+
```

### 3.1 Tech Stack Summary
- **Frontend**: Next.js 16.3.4 (Turbopack), React 19, TypeScript, Tailwind CSS, Lucide React.
- **Backend**: FastAPI 0.115, Uvicorn, Pydantic 2.x, SQLAlchemy 2.0, Python-Multipart.
- **Computer Vision & AI**: PyTorch, Torchvision, PIL, NumPy, scikit-learn.
- **Database**: SQLite (local/embedded) with seamless PostgreSQL compatibility.
- **Deployment**:
  - **Frontend**: Vercel (https://rice-leaf-detection-hazel.vercel.app/)
  - **Backend**: Render Web Service (https://rice-leaf-detection-bjpx.onrender.com)
  - **Version Control**: GitHub (https://github.com/SIVA2102004/RiceLeafDetection.git)

---

## 4. Machine Learning & Dataset Pipeline

### 4.1 Dataset Structure & Organization
The training and evaluation pipeline is built around 30,000 to 50,000 standardized rice leaf images curated across agricultural research repositories (including UCI, Kaggle, Mendeley Data, and IRRI archives):

```
dataset/
├── train/
│   ├── Bacterial_Leaf_Blight/
│   ├── Brown_Spot/
│   ├── Healthy/
│   ├── Leaf_Blast/
│   ├── Leaf_Scald/
│   ├── Narrow_Brown_Spot/
│   ├── Neck_Blast/
│   ├── Rice_Hispa/
│   ├── Sheath_Blight/
│   └── Tungro/
├── val/
└── test/
```

### 4.2 Data Preprocessing & Augmentation
To guarantee high generalization under varying field lighting and phone camera qualities:
- **Resizing & Normalization**: Standardized to 224x224 pixels, normalized using ImageNet channel statistics.
- **Augmentation Pipeline**:
  - Random Horizontal & Vertical Flips (p = 0.5)
  - Random Affine Rotations (±25 degrees)
  - Color Jitter (Brightness: 0.2, Contrast: 0.2, Saturation: 0.2)
  - Perspective Transformation (p = 0.2)

### 4.3 Neural Network Architecture
The core inference model leverages **EfficientNet-B0 / MobileNetV3-Large**:
- Pre-trained on ImageNet for transfer learning.
- Custom classification head:
  - Global Average Pooling (GAP)
  - Dropout layer (p = 0.3)
  - Dense Linear Layer: Linear(in_features=1280, out_features=10)
  - Softmax activation for multi-class probability estimation.
- **Loss Function**: Weighted Cross-Entropy Loss to handle class imbalance.
- **Optimization**: AdamW optimizer (lr = 1e-4, weight decay = 1e-2) with Cosine Annealing learning rate schedule.

---

## 5. Multilingual Localization System

The application features full-stack internationalization across **7 languages**:
1. **English** (`en`)
2. **Telugu** (`te` - తెలుగు)
3. **Hindi** (`hi` - हिन्दी)
4. **Tamil** (`ta` - தமிழ்)
5. **Kannada** (`kn` - ಕನ್ನಡ)
6. **Marathi** (`mr` - मराठी)
7. **Gujarati** (`gu` - ગુજરાતી)

### 5.1 Architecture of Localization Files
Each language is modularized into two distinct JSON bundles:
- `analyze_<lang>.json`: UI labels, camera controls, instructions, file dropzone text, and button states.
- `diseases_<lang>.json`: Complete agricultural knowledge base translated natively, including:
  - Translated Disease Names
  - Visual Symptoms
  - Immediate Precautions & Chemical Sprays
  - Organic/Cultural Management Steps

---

## 6. Detailed API Reference

The backend exposes a clean, RESTful OpenAPI specification:

### 6.1 Health & Diagnostic Endpoints
- `GET /health`: Health status probe for Render and deployment checks.

### 6.2 Prediction Endpoints
- `POST /api/predict`: Accepts an image file via `multipart/form-data` and returns classification code, name, confidence, severity, symptoms, and precautions.

### 6.3 Disease Knowledge Endpoints
- `GET /api/diseases`: Returns the list of all registered diseases and metadata.
- `GET /api/diseases/{code}`: Returns comprehensive agronomic data, chemical recommendations, and prevention strategies for a specific disease code.

### 6.4 Chatbot / Farmer Assistant Endpoints
- `POST /api/chat`: Grounded RAG conversation endpoint supporting regional languages and disease context.

---

## 7. Cloud Deployment & DevOps Guide

### 7.1 Live Production URLs
- **Frontend (Vercel)**: https://rice-leaf-detection-hazel.vercel.app/
- **Backend (Render)**: https://rice-leaf-detection-bjpx.onrender.com
- **API Documentation**: https://rice-leaf-detection-bjpx.onrender.com/docs
- **GitHub Repository**: https://github.com/SIVA2102004/RiceLeafDetection

---

## 8. Local Setup & Execution Guide

### Step 1: Clone Repository
```bash
git clone https://github.com/SIVA2102004/RiceLeafDetection.git
cd RiceLeafDetection
```

### Step 2: Run Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Step 3: Run Frontend
```bash
cd ../frontend
npm install
npm run dev -- -p 3000
```
