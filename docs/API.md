# RiceGuard AI REST API Specification

### Authentication
- `POST /api/auth/register` — Create farmer or admin account
- `POST /api/auth/login` — Sign in via mobile number or email and password
- `GET /api/auth/me` — Retrieve active user session profile

### Crop Image Analysis & Live Screening
- `POST /api/analysis/image` — Upload leaf photo, validate image quality, execute AI classification
- `POST /api/analysis/live` — Throttled mobile camera frame evaluation
- `GET /api/analysis/history` — Fetch recent crop scans with severity indicators
- `GET /api/analysis/{id}` — Retrieve detailed diagnostic report

### Verified Disease Knowledge Base
- `GET /api/diseases` — List all verified rice plant disease profiles
- `GET /api/diseases/{id}` — Retrieve symptoms, risk factors, precautions, and citations

### Farmer Assistant Chatbot
- `POST /api/chat/message` — Multilingual inquiry with diagnosis context
- `GET /api/chat/sessions` — Chat session history

### Field Management
- `GET /api/fields` — List registered plots
- `POST /api/fields` — Register a new rice plot
- `DELETE /api/fields/{id}` — Remove plot

### Feedback & Admin
- `POST /api/feedback` — Submit farmer feedback
- `GET /api/admin/dashboard` — Platform telemetry and analytics
- `GET /api/admin/models` — Active AI vision models registry
