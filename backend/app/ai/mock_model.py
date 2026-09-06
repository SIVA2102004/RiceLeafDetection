import io
import hashlib
import numpy as np
from PIL import Image
from typing import Dict, Any
from app.ai.interfaces import BaseRiceDiseaseModel
from app.ai.preprocessing import validate_image_quality

class MockRiceDiseaseModel(BaseRiceDiseaseModel):
    """
    Mock AI Model service for development, testing, and initial demonstration.
    Configured with the user-specified 10 core rice conditions.
    Uses deterministic heuristic hashing of image features so repeated submissions
    of the same photo return consistent, reproducible diagnoses.
    """
    DISEASE_CLASSES = [
        "Bacterial Leaf Blight",
        "Brown Spot",
        "Healthy",
        "Leaf Blast",
        "Leaf Scald",
        "Narrow Brown Spot",
        "Neck Blast",
        "Rice Hispa",
        "Sheath Blight",
        "Tungro"
    ]

    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        is_valid, is_rice_plant, message, brightness, sharpness = validate_image_quality(image_bytes)
        
        if not is_valid or not is_rice_plant:
            return {
                "is_rice_plant": is_rice_plant,
                "condition": "Unknown / Not Rice",
                "confidence": 0.45,
                "severity": "Unknown",
                "affected_area_percentage": 0.0,
                "model_version": "mock-riceguard-v2",
                "is_demo": True,
                "expert_review_required": True,
                "validation_message": message,
                "brightness": brightness,
                "sharpness": sharpness
            }

        # Deterministic pseudo-random generation based on image content hash
        digest = hashlib.md5(image_bytes).hexdigest()
        seed_val = int(digest[:8], 16)

        # Select condition based on hash
        idx = seed_val % len(self.DISEASE_CLASSES)
        condition = self.DISEASE_CLASSES[idx]

        # Calculate confidence between 0.78 and 0.96 (or lower for uncertain cases)
        conf_seed = (seed_val >> 4) % 100
        confidence = round(0.75 + (conf_seed / 100.0) * 0.22, 2)

        # Affected area & severity
        if condition == "Healthy":
            severity = "Low"
            affected_area = 0.0
            confidence = max(confidence, 0.90)
        else:
            area_seed = (seed_val >> 8) % 40
            affected_area = float(5 + area_seed)  # 5% to 45%
            if affected_area < 15.0:
                severity = "Low"
            elif affected_area < 28.0:
                severity = "Moderate"
            else:
                severity = "High"

        expert_review = confidence < 0.75 or condition == "Unknown / Not Rice"

        return {
            "is_rice_plant": True,
            "condition": condition,
            "confidence": confidence,
            "severity": severity,
            "affected_area_percentage": affected_area,
            "model_version": "mock-riceguard-v2",
            "is_demo": True,
            "expert_review_required": expert_review,
            "validation_message": "Leaf features successfully parsed.",
            "brightness": brightness,
            "sharpness": sharpness
        }
