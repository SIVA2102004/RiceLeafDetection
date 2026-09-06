import json

data = {
  "analyzeTitle": "వరి ఆకు వ్యాధి నిర్ధారణ పరీక్ష",
  "analyzeSub": "వరి ఆకు స్పష్టమైన ఫోటోను అప్‌లోడ్ చేయండి. AI నాణ్యతను తనిఖీ చేసి, తెగులు రకం మరియు తీవ్రతను అంచనా వేస్తుంది.",
  "dropPhotoPrompt": "వరి ఆకు ఫోటోను ఎంచుకోండి లేదా ఇక్కడ వేయండి",
  "dropPhotoFormats": "JPG, PNG, WebP (గరిష్టంగా 10MB)",
  "changePhoto": "మరొక ఫోటో మార్చండి",
  "startAiAnalysis": "AI పరీక్ష ప్రారంభించండి",
  "analyzingStep1": "చిత్ర నాణ్యతను తనిఖీ చేస్తోంది...",
  "analyzingStep2": "ఆకు ఉపరితలం మరియు మచ్చల తీరును పరిశీలిస్తోంది...",
  "demoAssessment": "డెమో / మాక్ AI ప్రాథమిక అంచనా",
  "preliminaryAssessment": "AI ప్రాథమిక ఆరోగ్య అంచనా",
  "confidenceScore": "విశ్వసనీయత స్కోరు",
  "estimatedSeverity": "అంచనా వేసిన తీవ్రత",
  "modelPipeline": "AI మోడల్ పైప్‌లైన్",
  "needsAgronomicReview": "వ్యవసాయ అధికారి పరిశీలన అవసరం:",
  "needsAgronomicReviewText": "ఈ పరీక్షలో AI విశ్వసనీయత తక్కువగా ఉంది లేదా అసాధారణ లక్షణాలు ఉన్నాయి. దయచేసి స్థానిక వ్యవసాయ అధికారి లేదా కేవీకే శాస్త్రవేత్తకు చూపించండి.",
  "keyObservedSymptoms": "ముఖ్య గమనించిన లక్షణాలు",
  "contributingRiskFactors": "తెగులు వ్యాప్తికి దోహదపడే కారణాలు",
  "recommendedPrecautions": "రైతు తీసుకోవాల్సిన జాగ్రత్తలు",
  "fieldManagementGuidelines": "పొలంలో పాటించాల్సిన యాజమాన్య పద్ధతులు",
  "haveQuestions": "ఈ ఫలితంపై ఏవైనా సందేహాలు ఉన్నాయా?",
  "haveQuestionsSub": "మా బహుభాషా రైతు సహాయకుడికి మీ పంట ఫలితం ఇప్పటికే తెలుసు, సురక్షిత తదుపరి చర్యలను అడగండి.",
  "askFarmerAssistantBtn": "రైతు సహాయకుడిని అడగండి",
  "wasHelpful": "ఈ విశ్లేషణ మీ వ్యవసాయ పనులకు ఉపయోగపడిందా?",
  "thankFeedback": "మీ అమూల్యమైన సమాచారానికి ధన్యవాదాలు!",
  "yes": "అవును",
  "no": "కాదు",
  "validationWarning": "చిత్ర నాణ్యత లేదా ధృవీకరణ హెచ్చరిక"
}

with open("frontend/src/locales/analyze_te.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Saved analyze_te.json")
