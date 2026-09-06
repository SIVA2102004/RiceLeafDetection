code = """import { LanguageCode } from "@/types";
import analyzeEn from "./analyze_en.json";
import analyzeTe from "./analyze_te.json";
import analyzeHi from "./analyze_hi.json";
import analyzeGu from "./analyze_gu.json";
import analyzeTa from "./analyze_ta.json";
import analyzeKn from "./analyze_kn.json";
import analyzeMr from "./analyze_mr.json";

import diseasesEn from "./diseases_en.json";
import diseasesTe from "./diseases_te.json";
import diseasesHi from "./diseases_hi.json";
import diseasesGu from "./diseases_gu.json";
import diseasesTa from "./diseases_ta.json";
import diseasesKn from "./diseases_kn.json";
import diseasesMr from "./diseases_mr.json";

export interface DiseaseTranslation {
  name: string;
  description: string;
  severity: { Low: string; Moderate: string; High: string; Unknown: string };
  symptoms: string[];
  risk_factors: string[];
  precautions: string[];
  management: string[];
}

export interface TranslationDict {
  appName: string;
  tagline: string;
  heroHeading: string;
  heroSub: string;
  analyzeNow: string;
  liveScreening: string;
  askAssistant: string;
  history: string;
  fields: string;
  admin: string;
  login: string;
  register: string;
  logout: string;
  confidence: string;
  severity: string;
  affectedArea: string;
  symptoms: string;
  precautions: string;
  management: string;
  disclaimerText: string;
  cameraPrompt: string;
  startCamera: string;
  stopCamera: string;
  captureFrame: string;
  voiceInput: string;
  readAloud: string;
  // Dynamic page translations
  analyzeTitle: string;
  analyzeSub: string;
  dropPhotoPrompt: string;
  dropPhotoFormats: string;
  changePhoto: string;
  startAiAnalysis: string;
  analyzingStep1: string;
  analyzingStep2: string;
  demoAssessment: string;
  preliminaryAssessment: string;
  confidenceScore: string;
  estimatedSeverity: string;
  modelPipeline: string;
  needsAgronomicReview: string;
  needsAgronomicReviewText: string;
  keyObservedSymptoms: string;
  contributingRiskFactors: string;
  recommendedPrecautions: string;
  fieldManagementGuidelines: string;
  haveQuestions: string;
  haveQuestionsSub: string;
  askFarmerAssistantBtn: string;
  wasHelpful: string;
  thankFeedback: string;
  yes: string;
  no: string;
  validationWarning: string;
  diseases: Record<string, DiseaseTranslation>;
}

export const translations: Record<LanguageCode, TranslationDict> = {
  en: {
    appName: "RiceGuard AI",
    tagline: "AI Crop Health & Disease Protection Platform",
    heroHeading: "Know Your Rice Crop's Health in Seconds",
    heroSub: "Use your phone camera or upload a rice leaf photo for an AI-assisted crop health assessment and verified farmer guidance.",
    analyzeNow: "Analyze Leaf",
    liveScreening: "Live Screening",
    askAssistant: "Farmer Assistant",
    history: "Diagnosis History",
    fields: "My Fields",
    admin: "Admin Portal",
    login: "Login",
    register: "Register",
    logout: "Logout",
    confidence: "AI Confidence",
    severity: "Estimated Severity",
    affectedArea: "Affected Area",
    symptoms: "Identified Symptoms",
    precautions: "Recommended Precautions",
    management: "Field Management Guidance",
    disclaimerText: "RiceGuard AI provides an AI-assisted preliminary assessment and educational guidance. Results are not a guaranteed diagnosis. For severe crop damage, consult your local agricultural officer.",
    cameraPrompt: "Align the rice leaf within the viewfinder frame with steady illumination.",
    startCamera: "Start Camera",
    stopCamera: "Stop Camera",
    captureFrame: "Screen Leaf",
    voiceInput: "Speak Question",
    readAloud: "Read Answer",
    ...analyzeEn,
    diseases: diseasesEn as unknown as Record<string, DiseaseTranslation>
  },
  te: {
    appName: "రైస్ గార్డ్ AI",
    tagline: "వరి పంట తెగుళ్ల గుర్తింపు మరియు రైతు రక్షణ వేదిక",
    heroHeading: "క్షణాల్లో మీ వరి పంట ఆరోగ్యాన్ని తెలుసుకోండి",
    heroSub: "AI ఆధారిత ఆరోగ్య విశ్లేషణ మరియు రైతు మార్గదర్శకత్వం కోసం వరి ఆకు ఫోటోను అప్‌లోడ్ చేయండి లేదా కెమెరాను ఉపయోగించండి.",
    analyzeNow: "ఆకును పరీక్షించండి",
    liveScreening: "లైవ్ స్క్రీనింగ్",
    askAssistant: "రైతు సహాయకుడు",
    history: "పరీక్షల చరిత్ర",
    fields: "నా పొలాలు",
    admin: "అడ్మిన్ పోర్టల్",
    login: "లాగిన్",
    register: "నమోదు చేసుకోండి",
    logout: "లాగౌట్",
    confidence: "AI విశ్వసనీయత",
    severity: "తీవ్రత స్థాయి",
    affectedArea: "ప్రభావిత ప్రాంతం",
    symptoms: "లక్షణాలు",
    precautions: "జాగ్రత్తలు",
    management: "యాజమాన్య పద్ధతులు",
    disclaimerText: "రైస్ గార్డ్ AI ప్రాథమిక సమాచారాన్ని మాత్రమే అందిస్తుంది. తీవ్రమైన సమస్యలకు వ్యవసాయ అధికారిని సంప్రదించండి.",
    cameraPrompt: "వరి ఆకును కెమెరా ఫ్రేమ్‌లో స్పష్టంగా ఉంచండి.",
    startCamera: "కెమెరా ప్రారంభించు",
    stopCamera: "కెమెరా ఆపు",
    captureFrame: "ఆకును పరిశీలించు",
    voiceInput: "మాట్లాడండి",
    readAloud: "సమాధానం వినండి",
    ...analyzeTe,
    diseases: diseasesTe as unknown as Record<string, DiseaseTranslation>
  },
  hi: {
    appName: "राइसगार्ड एआई",
    tagline: "धान फसल रोग पहचान एवं किसान सहायता मंच",
    heroHeading: "कुछ ही सेकंड में जानें अपने धान की फसल का स्वास्थ्य",
    heroSub: "एआई-सहायता प्राप्त स्वास्थ्य मूल्यांकन और सत्यापित किसान मार्गदर्शन के लिए धान की पत्ती की तस्वीर अपलोड करें या कैमरे का उपयोग करें।",
    analyzeNow: "पत्ती की जांच करें",
    liveScreening: "लाइव स्क्रीनिंग",
    askAssistant: "किसान सहायक",
    history: "निदान इतिहास",
    fields: "मेरे खेत",
    admin: "व्यवस्थापक पोर्टल",
    login: "लॉग इन",
    register: "पंजीकरण",
    logout: "लॉग आउट",
    confidence: "एआई विश्वास स्कोर",
    severity: "अनुमानित गंभीरता",
    affectedArea: "प्रभावित क्षेत्र",
    symptoms: "पहचाने गए लक्षण",
    precautions: "सुझाए गए उपाय",
    management: "खेत प्रबंधन मार्गदर्शन",
    disclaimerText: "राइसगार्ड एआई एक प्रारंभिक एआई-सहायता प्राप्त मूल्यांकन प्रदान करता है। गंभीर नुकसान के लिए स्थानीय कृषि अधिकारी से सलाह लें।",
    cameraPrompt: "धान की पत्ती को कैमरे के फ्रेम में स्पष्ट रूप से रखें।",
    startCamera: "कैमरा शुरू करें",
    stopCamera: "कैमरा बंद करें",
    captureFrame: "जांच करें",
    voiceInput: "बोलकर पूछें",
    readAloud: "उत्तर सुनें",
    ...analyzeHi,
    diseases: diseasesHi as unknown as Record<string, DiseaseTranslation>
  },
  gu: {
    appName: "રાઇસગાર્ડ AI",
    tagline: "ડાંગર પાક રોગ નિદાન અને ખેડૂત સહાયતા પ્લેટફોર્મ",
    heroHeading: "સેકન્ડોમાં તમારા ડાંગરના પાકનું સ્વાસ્થ્ય જાણો",
    heroSub: "AI આધારિત પાક મૂલ્યાંકન અને વિશ્વસનીય માર્ગદર્શન મેળવવા માટે ડાંગરના પાનની તસવીર અપલોડ કરો અથવા કેમેરા વાપરો.",
    analyzeNow: "પાનની તપાસ કરો",
    liveScreening: "લાઈવ સ્ક્રીનિંગ",
    askAssistant: "ખેડૂત સહાયક",
    history: "નિદાન ઇતિહાસ",
    fields: "મારા ખેતરો",
    admin: "એડમિન પોર્ટલ",
    login: "લોગિન",
    register: "નોંધણી",
    logout: "લોગઆઉટ",
    confidence: "AI ચોકસાઈ",
    severity: "તીવ્રતા",
    affectedArea: "અસરગ્રસ્ત વિસ્તાર",
    symptoms: "લક્ષણો",
    precautions: "સાવચેતીનાં પગલાં",
    management: "ખેત વ્યવસ્થાપન",
    disclaimerText: "રાઇસગાર્ડ AI માત્ર પ્રાથમિક મૂલ્યાંકન પૂરું પાડે છે. ગંભીર નુકસાન માટે સ્થાનિક કૃષિ અધિકારીની સલાહ લો.",
    cameraPrompt: "ડાંગરના પાનને કેમેરા ફ્રેમમાં બરાબર ગોઠવો.",
    startCamera: "કેમેરા શરૂ કરો",
    stopCamera: "કેમેરા બંધ કરો",
    captureFrame: "તપાસ કરો",
    voiceInput: "બોલીને પૂછો",
    readAloud: "જવાબ સાંભળો",
    ...analyzeGu,
    diseases: diseasesGu as unknown as Record<string, DiseaseTranslation>
  },
  ta: {
    appName: "ரைஸ்கார்ட் AI",
    tagline: "நெல் பயிர் நோய் கண்டறிதல் மற்றும் விவசாய பாதுகாப்பு தளம்",
    heroHeading: "நொடிகளில் உங்கள் நெல் பயிரின் ஆரோக்கியத்தை அறியுங்கள்",
    heroSub: "நெல் இலையின் புகைப்படத்தை பதிவேற்றவும் அல்லது கேமராவைப் பயன்படுத்தி AI ஆரோக்கிய மதிப்பீட்டைப் பெறவும்.",
    analyzeNow: "இலையை பகுப்பாய்வு செய்க",
    liveScreening: "நேரடி திரையிடல்",
    askAssistant: "விவசாயி உதவியாளர்",
    history: "வரலாறு",
    fields: "என் வயல்கள்",
    admin: "நிர்வாக போர்டல்",
    login: "உள்நுழைய",
    register: "பதிவு செய்க",
    logout: "வெளியேறு",
    confidence: "AI நம்பிக்கை",
    severity: "தீவிர நிலை",
    affectedArea: "பாதிக்கப்பட்ட பகுதி",
    symptoms: "அறிகுறிகள்",
    precautions: "முன்னெச்சரிக்கைகள்",
    management: "பயிர் மேலாண்மை",
    disclaimerText: "ரைஸ்கார்ட் AI முதற்கட்ட வழிகாட்டுதலை மட்டுமே வழங்குகிறது. தீவிர பாதிப்புகளுக்கு வேளாண்மை அலுவலரை அணுகவும்.",
    cameraPrompt: "நெல் இலையை கேமரா திரையில் சரியாக வைக்கவும்.",
    startCamera: "கேமரா தொடங்கு",
    stopCamera: "கேமரா நிறுத்து",
    captureFrame: "பரிசோதிக்க",
    voiceInput: "பேசுங்கள்",
    readAloud: "பதில் கேட்க",
    ...analyzeTa,
    diseases: diseasesTa as unknown as Record<string, DiseaseTranslation>
  },
  kn: {
    appName: "ರೈಸ್‌ಗಾರ್ಡ್ AI",
    tagline: "ಭತ್ತದ ಬೆಳೆ ರೋಗ ಪತ್ತೆ ಮತ್ತು ರೈತರ ನೆರವು ವೇದಿಕೆ",
    heroHeading: "ಕ್ಷಣಗಳಲ್ಲಿ ನಿಮ್ಮ ಭತ್ತದ ಬೆಳೆಯ ಆರೋಗ್ಯವನ್ನು ತಿಳಿಯಿರಿ",
    heroSub: "AI ಆಧಾರಿತ ಬೆಳೆ ಆರೋಗ್ಯ ಮೌಲ್ಯಮಾಪನಕ್ಕಾಗಿ ಭತ್ತದ ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಕ್ಯಾಮೆರಾ ಬಳಸಿ.",
    analyzeNow: "ಎಲೆ ಪರೀಕ್ಷಿಸಿ",
    liveScreening: "ಲೈವ್ ಸ್ಕ್ರೀನಿಂಗ್",
    askAssistant: "ರೈತ ಸಹಾಯಕ",
    history: "ಇತಿಹಾಸ",
    fields: "ನನ್ನ ಹೊಲಗಳು",
    admin: "ಅಡ್ಮಿನ್ ಪೋರ್ಟಲ್",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    logout: "ಲಾಗೌಟ್",
    confidence: "AI ವಿಶ್ವಾಸಾರ್ಹತೆ",
    severity: "ತೀವ್ರತೆ",
    affectedArea: "ಬಾಧಿತ ಪ್ರದೇಶ",
    symptoms: "ರೋಗ ಲಕ್ಷಣಗಳು",
    precautions: "ಮುನ್ನೆಚ್ಚರಿಕೆ ಕ್ರಮಗಳು",
    management: "ಕ್ಷೇತ್ರ ನಿರ್ವಹಣೆ",
    disclaimerText: "ರೈಸ್‌ಗಾರ್ಡ್ AI ಪ್ರಾಥಮಿಕ ಮೌಲ್ಯಮಾಪನವನ್ನು ಒದಗಿಸುತ್ತದೆ. ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    cameraPrompt: "ಭತ್ತದ ಎಲೆಯನ್ನು ಕ್ಯಾಮರಾ ಫ್ರೇಮ್‌ನಲ್ಲಿ ಸರಿಯಾಗಿ ಇರಿಸಿ.",
    startCamera: "ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಿ",
    stopCamera: "ಕ್ಯಾಮೆರಾ ನಿಲ್ಲಿಸಿ",
    captureFrame: "ಪರೀಕ್ಷಿಸಿ",
    voiceInput: "ಮಾತನಾಡಿ",
    readAloud: "ಉತ್ತರ ಕೇಳಿ",
    ...analyzeKn,
    diseases: diseasesKn as unknown as Record<string, DiseaseTranslation>
  },
  mr: {
    appName: "राइसगार्ड AI",
    tagline: "भात पीक रोग निदान आणि शेतकरी सहाय्य प्लॅटफॉर्म",
    heroHeading: "काही सेकंदात जाणून घ्या तुमच्या भात पिकाचे आरोग्य",
    heroSub: "AI आधारित पीक आरोग्य तपासणी आणि खात्रीशीर सल्ल्यासाठी भाताच्या पानाचा फोटो अपलोड करा किंवा कॅमेरा वापरा.",
    analyzeNow: "पानाची तपासणी करा",
    liveScreening: "थेट स्क्रीनिंग",
    askAssistant: "शेतकरी सहाय्यक",
    history: "इतिहास",
    fields: "माझी शेतं",
    admin: "अॅडमिन पोर्टल",
    login: "लॉग इन",
    register: "नोंदणी",
    logout: "लॉग आउट",
    confidence: "AI विश्वासार्हता",
    severity: "तीव्रता",
    affectedArea: "बाधित क्षेत्र",
    symptoms: "लक्षणे",
    precautions: "काळजीचे उपाय",
    management: "शेती व्यवस्थापन",
    disclaimerText: "राइसगार्ड AI प्राथमिक अंदाज देते. गंभीर समस्या असल्यास स्थानिक कृषी अधिकाऱ्यांचा सल्ला घ्या.",
    cameraPrompt: "भाताचे पान कॅमेरा फ्रेममध्ये व्यवस्थित धरा.",
    startCamera: "कॅमेरा सुरू करा",
    stopCamera: "कॅमेरा बंद करा",
    captureFrame: "तपासा",
    voiceInput: "बोला",
    readAloud: "उत्तर ऐका",
    ...analyzeMr,
    diseases: diseasesMr as unknown as Record<string, DiseaseTranslation>
  }
};
"""

with open("frontend/src/locales/index.ts", "w", encoding="utf-8") as f:
    f.write(code)
print("Updated frontend/src/locales/index.ts with ALL languages!")
