# RiceGuard AI System Architecture

## 1. High-Level Architecture

RiceGuard AI separates concern cleanly across user interfaces, API routing, database models, agricultural knowledge verification, and machine learning inference services:

```
+-------------------------------------------------------------+
|                 Farmer & Admin Clients                      |
| (Mobile Browser / Desktop / PWA - Next.js 14+ App Router)   |
+------------------------------+------------------------------+
                               | REST / HTTP JSON
                               v
+-------------------------------------------------------------+
|                      FastAPI Backend                        |
|  - Auth & Security (JWT, bcrypt, Role-based access)         |
|  - Crop Analysis Router (/api/analysis/image, /live)        |
|  - Farmer Assistant & RAG (/api/chat/message)               |
|  - Field Management (/api/fields)                           |
|  - Verified Knowledge Base (/api/diseases)                  |
|  - Admin & Expert Review Queue (/api/admin)                 |
+--------------+------------------------------+---------------+
               |                              |
               v                              v
+-------------------------------+ +---------------------------+
|  AI Inference Abstraction     | |   Relational Database     |
|  - BaseRiceDiseaseModel       | |   (PostgreSQL / SQLite)   |
|  - Image Preprocessing        | |   - Users, Fields         |
|    * Brightness & Sharpness   | |   - Diseases Knowledge    |
|    * Leaf Foliage Validation  | |   - Analyses & Feedback   |
|  - MockRiceDiseaseModel       | |   - Chat Sessions         |
|  - RiceDiseaseModelService    | |   - Model Registry        |
+-------------------------------+ +---------------------------+
```

## 2. Pluggable AI Service

The frontend and backend API endpoints interact strictly through the `BaseRiceDiseaseModel` abstract interface:
- **`DEMO_MODE=true`**: Ingests images, evaluates photo quality, and uses consistent deterministic heuristics with `is_demo=True` markers.
- **`DEMO_MODE=false`**: Loads PyTorch/ONNX/TensorFlow weights from `MODEL_PATH` without requiring any changes to frontend components.

## 3. Agricultural RAG & Safety Guardrails

The conversational assistant matches user queries against verified records in the database, while enforcing safety guidelines:
1. Rejects prescribing arbitrary chemical dosages or unregistered commercial trade names.
2. Directs farmers to certified extension officers (KVK / block ADOs).
3. Connects diagnosis context directly to follow-up questions.
