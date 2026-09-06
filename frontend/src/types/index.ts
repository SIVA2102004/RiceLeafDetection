export type LanguageCode = "en" | "te" | "hi" | "gu" | "ta" | "kn" | "mr";

export interface AnalysisResult {
  analysis_id: number;
  is_rice_plant: boolean;
  condition: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High" | "Unknown";
  affected_area_percentage: number;
  symptoms: string[];
  risk_factors: string[];
  precautions: string[];
  management: string[];
  model_version: string;
  is_demo: boolean;
  expert_review_required: boolean;
  image_url: string;
  created_at: string;
  field_id?: number | null;
  quality?: {
    is_valid: boolean;
    is_rice_plant: boolean;
    message: string;
    brightness_score: number;
    sharpness_score: number;
  };
}

export interface DiseaseInfo {
  id: number;
  name: string;
  scientific_name?: string;
  description: string;
  symptoms: string[];
  risk_factors: string[];
  precautions: string[];
  management: string[];
  source?: string;
  region?: string;
  status: string;
}

export interface FarmerField {
  id: number;
  user_id: number;
  name: string;
  village?: string;
  area: number;
  area_unit: string;
  variety?: string;
  planting_date?: string;
  harvest_date?: string;
  notes?: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  message: string;
  language: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: "farmer" | "expert" | "admin";
  language: LanguageCode;
  village?: string;
  district?: string;
  state?: string;
  created_at: string;
}
