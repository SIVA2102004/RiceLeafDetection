# RiceGuard AI

**RiceGuard AI** is a production-quality, full-stack, mobile-first agricultural AI platform that empowers rice farmers to screen crops via photo upload or live camera, receive preliminary AI assessments with confidence and severity indicators, access verified precautions, and converse with an AI Farmer Assistant in multiple Indian languages with speech support.

---

## Key Features

1. **Photo Upload & Live Camera Screening**:
   - Automated image quality check (resolution, blur, darkness/brightness, rice foliage detection).
   - Real-time viewfinder reticle with camera switching (`environment` / `user`).
   - Throttled inference pipeline to avoid excessive network load.
2. **AI Model Abstraction Layer**:
   - Switchable via `DEMO_MODE=true/false` without altering frontend architecture.
   - Heuristic mock model and production deep learning model adapters.
   - Strict safety enforcement: zero fabricated confidence or diagnostic claims.
3. **Verified Agricultural Knowledge Base**:
   - 10 core classes (Healthy, Rice Blast, Bacterial Leaf Blight, Brown Spot, Leaf Smut, Tungro, Sheath Blight, False Smut, Sheath Rot, Unknown/Not Rice).
   - Symptoms, risk factors, precautions, cultural management, and research citations.
4. **Multilingual Farmer Chatbot (RAG)**:
   - Ingests latest diagnosis context automatically.
   - Web Speech STT (speech-to-text) and TTS (text-to-speech with play/stop).
   - Internationalized across 7 Indian languages: English, Telugu, Hindi, Gujarati, Tamil, Kannada, Marathi.
5. **Farm & Health Timeline Management**:
   - Field plot registry (cultivar, acreage, sowing notes).
   - Historical scan tracking and farmer feedback submission.
6. **Admin & Expert Quality Assurance**:
   - AI model registry and telemetry.
   - Low-confidence review queue.

---

## Quick Start Guide

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend API documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### 3. Demo Credentials

- **Farmer**: Mobile `9123456780` | Password `Farmer@12345`
- **Admin**: Mobile `9876543210` | Password `Admin@12345`
