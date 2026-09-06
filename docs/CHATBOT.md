# RiceGuard AI — Conversational Safety & RAG Architecture

## 1. Safety Guardrails

Agricultural conversational systems operate under strict regulatory and biological requirements. Hallucinating chemical prescriptions, unregulated pesticide dosages, or invalid disease names poses severe risks to farm livelihoods and food safety.

RiceGuard AI implements a multi-tier safety filter:

1. **Trade Brand & Dosage Rejection**:
   - The assistant explicitly declines requests for unregistered chemical dosages or commercial brand names.
   - It redirects the farmer toward Integrated Pest Management (IPM), cultural controls (water aeration, nitrogen regulation), and local extension officers.
2. **Context-Aware Follow-ups**:
   - When navigated from an image scan, the assistant ingests the analysis ID, condition, confidence, and estimated severity.
   - Farmers can ask "What should I do now?" without having to manually describe their disease or severity level again.
3. **Mandatory Disclaimer**:
   - Every assistant response appends the official statutory disclaimer:
   > *"RiceGuard AI provides preliminary agricultural guidance based on verified research datasets. For severe crop symptoms or regulated treatment dosages, always consult your nearest Agricultural Officer or Krishi Vigyan Kendra (KVK)."*

## 2. Supported Languages & Speech

- **Input**: Multilingual text or speech-to-text (Web Speech API) across English, Telugu, Hindi, Gujarati, Tamil, Kannada, and Marathi.
- **Output**: Structured markdown response with text-to-speech audio synthesis controls (Play / Pause / Stop).
