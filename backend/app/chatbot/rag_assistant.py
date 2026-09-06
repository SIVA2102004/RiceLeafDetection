import json
import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.all_models import Disease, Analysis, SeverityLevel

INTENT_KEYWORDS = {
    "fertilizer": ["fertilizer", "urea", "nitrogen", "potash", "npk", "dose", "compost", "dung"],
    "irrigation": ["water", "irrigation", "drainage", "flood", "stagnant", "dry", "moisture"],
    "disease": ["blast", "blight", "spot", "smut", "tungro", "rot", "brown", "yellow", "lesion", "die", "wilt"],
    "spray": ["spray", "chemical", "pesticide", "fungicide", "medicine", "dosage"],
    "prevention": ["prevent", "protect", "seed", "variety", "resistant", "spacing", "nursery"]
}

DISCLAIMER = (
    "\n\n⚠️ *Safety Notice*: RiceGuard AI provides preliminary agricultural guidance based on verified research datasets. "
    "For severe crop symptoms or regulated treatment dosages, always consult your nearest Agricultural Officer or Krishi Vigyan Kendra (KVK)."
)

class FarmerAssistantRAG:
    """
    RAG-powered conversational assistant for rice farmers.
    Combines verified database knowledge records, diagnosis context, and safety guardrails.
    Never invents pesticide brands, chemical dosages, or regulated instructions.
    """
    def __init__(self, db: Session):
        self.db = db

    def generate_response(
        self,
        query: str,
        language: str = "en",
        analysis_context: Optional[Analysis] = None
    ) -> str:
        q_lower = query.lower()

        # Step 1: Detect intent and mentioned diseases
        detected_diseases = []
        all_diseases = self.db.query(Disease).all()
        for d in all_diseases:
            if d.name.lower() in q_lower:
                detected_diseases.append(d)

        # Contextual link if query is follow-up to diagnosis
        if not detected_diseases and analysis_context:
            matching = [d for d in all_diseases if d.name.lower() == analysis_context.condition.lower()]
            if matching:
                detected_diseases.append(matching[0])

        # Step 2: Formulate verified knowledge-based answer
        if "what should i do" in q_lower or "next step" in q_lower or "treatment" in q_lower or "how to cure" in q_lower or "management" in q_lower:
            if analysis_context and detected_diseases:
                target = detected_diseases[0]
                try:
                    precautions = json.loads(target.precautions)
                    management = json.loads(target.management)
                except Exception:
                    precautions = [target.precautions]
                    management = [target.management]

                resp = (
                    f"Based on your recent assessment indicating **{target.name}** "
                    f"(AI Confidence: {int(analysis_context.confidence * 100)}%, Severity: {analysis_context.severity.value}):\n\n"
                    f"### Recommended Immediate Actions:\n"
                )
                for p in precautions:
                    resp += f"• {p}\n"
                resp += "\n### Field Management & Cultural Practices:\n"
                for m in management:
                    resp += f"• {m}\n"
                return resp + DISCLAIMER

        if any(w in q_lower for w in ["spray", "chemical", "pesticide", "fungicide", "medicine", "dosage"]):
            return (
                "Regarding chemical plant protection: In adherence to safety regulations and integrated pest management (IPM) protocols, "
                "RiceGuard AI does not prescribe chemical trade brands or unverified chemical dosages without an on-site soil and leaf inspection.\n\n"
                "**Recommended Safe Steps:**\n"
                "1. Isolate severely affected hills or rogue infected panicles where appropriate.\n"
                "2. Regulate nitrogen top-dressing and ensure field drainage to reduce humidity in the micro-climate.\n"
                "3. Present a sample to your block Agricultural Development Officer (ADO) or local KVK for an approved regional treatment advisory."
                + DISCLAIMER
            )

        if detected_diseases:
            target = detected_diseases[0]
            try:
                symptoms = json.loads(target.symptoms)
                risk_factors = json.loads(target.risk_factors)
                precautions = json.loads(target.precautions)
            except Exception:
                symptoms = [target.symptoms]
                risk_factors = [target.risk_factors]
                precautions = [target.precautions]

            resp = (
                f"### Verified Profile: {target.name} (*{target.scientific_name or ''}*)\n\n"
                f"{target.description}\n\n"
                f"**Key Symptoms to Observe:**\n"
            )
            for s in symptoms:
                resp += f"• {s}\n"
            resp += "\n**Contributing Risk Factors:**\n"
            for r in risk_factors:
                resp += f"• {r}\n"
            resp += "\n**Recommended Preventive Care:**\n"
            for p in precautions:
                resp += f"• {p}\n"
            resp += f"\n*Reference Source: {target.source or 'National Rice Research Guidelines'}*"
            return resp + DISCLAIMER

        if any(w in q_lower for w in ["water", "irrigation", "drain"]):
            return (
                "### Rice Crop Water Management Advisory:\n\n"
                "• **Tillering Stage**: Maintain a shallow water depth of 2 to 3 cm to promote vigorous tillering.\n"
                "• **Panicle Initiation to Flowering**: Ensure adequate moisture (3 to 5 cm standing water) as water stress at this stage severely reduces grain fertility.\n"
                "• **Disease Prevention**: If bacterial blight or sheath blight appears in the field, drain standing water immediately and allow the soil surface to aerate before re-irrigating.\n"
                "• **Ripening**: Drain field completely 10-14 days prior to harvest to facilitate uniform ripening and mechanical harvesting."
                + DISCLAIMER
            )

        if any(w in q_lower for w in ["fertilizer", "urea", "nitrogen", "npk"]):
            return (
                "### Rice Nutrient Management Advisory:\n\n"
                "• **Balanced Application**: Excessive use of chemical nitrogen (Urea) produces succulent, tender foliage that is highly vulnerable to Blast, Bacterial Blight, and Sheath Rot.\n"
                "• **Split Doses**: Split nitrogen application across basal, active tillering, and panicle initiation stages rather than a heavy single top-dressing.\n"
                "• **Potash Application**: Adequate muriate of potash (MOP) strengthens plant cell walls and confers natural resistance against fungal and bacterial pathogens.\n"
                "• **Soil Testing**: Always calibrate nutrient applications according to your Soil Health Card recommendations."
                + DISCLAIMER
            )

        # Fallback query guidance localized
        if language == "te":
            return (
                "వరి పంట ఆరోగ్యం మరియు ఆకు సమస్యలు వాతావరణ పరిస్థితులు, పోషకాల లోపం లేదా తెగుళ్ల వల్ల రావచ్చు.\n\n"
                "**నేను మీకు ఎలా సహాయపడగలను:**\n"
                "• **ఆకును పరీక్షించండి**: కెమెరా లేదా ఫోటో అప్‌లోడ్ ద్వారా తెగులును విశ్లేషించండి.\n"
                "• **తెగుళ్ల గురించి అడగండి**: అగ్గి తెగులు (Blast), బాక్టీరియా ఆకు ఎండు (Bacterial Blight), ఎండిన మచ్చ (Brown Spot), టుంగ్రో, లేదా పాము పొడ తెగులు గురించి అడగండి.\n"
                "• **యాజమాన్య పద్ధతులు**: నీటి యాజమాన్యం, ఎరువుల సమతుల్యత మరియు నివారణ పద్ధతుల గురించి అడగండి.\n\n"
                "⚠️ *రైతు గమనిక: తీవ్రమైన పంట నష్టానికి మీ సమీప వ్యవసాయ విస్తరణ అధికారిని (AEO) సంప్రదించండి.*"
            )
        elif language == "hi":
            return (
                "धान की फसल का स्वास्थ्य और पत्तियों की समस्याएं मौसम, पोषक तत्वों की कमी या फंगल/बैक्टीरियल रोगों के कारण हो सकती हैं।\n\n"
                "**मैं आपकी किस प्रकार सहायता कर सकता हूँ:**\n"
                "• **पत्ती की जांच करें**: कैमरा या फोटो अपलोड सुविधा का उपयोग करके रोग की पहचान करें।\n"
                "• **रोगों के बारे में पूछें**: झुलसा (Blast), जीवाणु झुलसा (Bacterial Blight), भूरा धब्बा (Brown Spot), या शीथ ब्लाइट के बारे में पूछें।\n"
                "• **खेत प्रबंधन**: जल प्रबंधन, संतुलित उर्वरक और निवारक उपायों के बारे में जानकारी लें।\n\n"
                "⚠️ *सलाह: गंभीर समस्या होने पर अपने स्थानीय कृषि अधिकारी या कृषि विज्ञान केंद्र (KVK) से परामर्श लें।*"
            )

        return (
            "Rice crop health and leaf conditions can arise from environmental stress, nutrient deficiencies, or fungal/bacterial pathogens.\n\n"
            "**How I can assist you:**\n"
            "• **Upload or Screen a Leaf**: Use the camera or upload feature to let RiceGuard analyze the visual symptoms.\n"
            "• **Inquire About Diseases**: Ask about Rice Blast, Bacterial Blight, Brown Spot, Tungro, Sheath Blight, or Smut.\n"
            "• **Management Practices**: Ask about water management, fertilizer balance, or preventive cultural practices."
            + DISCLAIMER
        )
