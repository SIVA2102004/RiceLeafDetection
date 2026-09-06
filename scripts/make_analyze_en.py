import json

data = {
  "analyzeTitle": "Rice Leaf Disease Analysis",
  "analyzeSub": "Upload a clear photograph of a rice leaf blade. The AI model checks quality, identifies potential disease signatures, and calculates preliminary severity.",
  "dropPhotoPrompt": "Select or Drop Rice Leaf Photo",
  "dropPhotoFormats": "Supports JPG, PNG, WebP up to 10MB",
  "changePhoto": "Change Photo",
  "startAiAnalysis": "Start AI Analysis",
  "analyzingStep1": "Checking image quality...",
  "analyzingStep2": "Analyzing leaf lamina and lesion patterns...",
  "demoAssessment": "Demo/Mock AI Assessment",
  "preliminaryAssessment": "AI Preliminary Assessment",
  "confidenceScore": "Confidence Score",
  "estimatedSeverity": "Estimated Severity",
  "modelPipeline": "Model Pipeline",
  "needsAgronomicReview": "Needs Agronomic Review:",
  "needsAgronomicReviewText": "The AI model confidence is below standard benchmark or symptoms appear atypical. A certified agricultural officer or KVK extension agent should inspect the crop.",
  "keyObservedSymptoms": "Key Observed Symptoms",
  "contributingRiskFactors": "Contributing Risk Factors",
  "recommendedPrecautions": "Recommended Precautions",
  "fieldManagementGuidelines": "Field Management Guidelines",
  "haveQuestions": "Have Questions About This Assessment?",
  "haveQuestionsSub": "Our multilingual Farmer Assistant automatically knows this diagnosis and can suggest safe next steps.",
  "askFarmerAssistantBtn": "Ask Farmer Assistant",
  "wasHelpful": "Was this assessment helpful to your farm monitoring?",
  "thankFeedback": "Thank you for your feedback!",
  "yes": "Yes",
  "no": "No",
  "validationWarning": "Validation or Processing Warning"
}

with open("frontend/src/locales/analyze_en.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
print("Saved analyze_en.json")
