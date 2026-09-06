import os
import json
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Analysis, Disease, Field, User, SeverityLevel
from app.schemas.all_schemas import AnalysisResponse, QualityCheckResult
from app.ai.rice_disease_model import get_ai_model
from app.core.config import settings
from app.api.auth import get_current_user

router = APIRouter(prefix="/analysis", tags=["Crop Analysis"])

os.makedirs(settings.STORAGE_DIR, exist_ok=True)

@router.post("/image", response_model=AnalysisResponse)
async def analyze_image(
    file: UploadFile = File(...),
    field_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    # Support both authenticated user and anonymous preview
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image (JPG, PNG, or WebP).")

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Image file size exceeds limit of {settings.MAX_UPLOAD_SIZE_MB}MB.")

    # Save image file locally
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(settings.STORAGE_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/{filename}"

    # Run AI inference abstraction
    ai_model = get_ai_model()
    prediction = ai_model.predict(contents)

    # Fetch verified disease metadata from knowledge base
    disease_name = prediction["condition"]
    disease_rec = db.query(Disease).filter(Disease.name == disease_name).first()

    if disease_rec:
        try:
            symptoms = json.loads(disease_rec.symptoms)
            risk_factors = json.loads(disease_rec.risk_factors)
            precautions = json.loads(disease_rec.precautions)
            management = json.loads(disease_rec.management)
        except Exception:
            symptoms = [disease_rec.symptoms]
            risk_factors = [disease_rec.risk_factors]
            precautions = [disease_rec.precautions]
            management = [disease_rec.management]
    else:
        symptoms = ["Visual anomalies observed on leaf lamina"]
        risk_factors = ["High ambient humidity, rain splash, or physiological stress"]
        precautions = ["Inspect neighboring hills and maintain standard irrigation balance"]
        management = ["Consult block Agricultural Officer for a verified specimen check"]

    # Persist analysis
    analysis = Analysis(
        user_id=None,
        field_id=field_id,
        image_url=image_url,
        condition=disease_name,
        confidence=prediction["confidence"],
        severity=getattr(SeverityLevel, prediction["severity"].upper(), SeverityLevel.LOW),
        affected_area_percentage=prediction["affected_area_percentage"],
        model_version=prediction["model_version"],
        is_demo=prediction["is_demo"],
        expert_review_required=prediction["expert_review_required"]
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    quality = QualityCheckResult(
        is_valid=True,
        is_rice_plant=prediction["is_rice_plant"],
        message=prediction.get("validation_message", "Completed"),
        brightness_score=prediction.get("brightness", 120.0),
        sharpness_score=prediction.get("sharpness", 50.0)
    )

    return AnalysisResponse(
        analysis_id=analysis.id,
        is_rice_plant=prediction["is_rice_plant"],
        condition=analysis.condition,
        confidence=analysis.confidence,
        severity=analysis.severity,
        affected_area_percentage=analysis.affected_area_percentage,
        symptoms=symptoms,
        risk_factors=risk_factors,
        precautions=precautions,
        management=management,
        model_version=analysis.model_version,
        is_demo=analysis.is_demo,
        expert_review_required=analysis.expert_review_required,
        image_url=analysis.image_url,
        created_at=analysis.created_at,
        field_id=analysis.field_id,
        quality=quality
    )

@router.post("/live", response_model=AnalysisResponse)
async def analyze_live_frame(
    file: UploadFile = File(...),
    field_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Dedicated endpoint for throttled live camera frames.
    Accepts downsampled frame, performs rapid heuristic quality check and disease assessment.
    """
    return await analyze_image(file=file, field_id=field_id, db=db)

@router.get("/history", response_model=List[AnalysisResponse])
def get_analysis_history(
    db: Session = Depends(get_db)
):
    analyses = db.query(Analysis).order_by(Analysis.created_at.desc()).limit(50).all()
    results = []
    for a in analyses:
        disease_rec = db.query(Disease).filter(Disease.name == a.condition).first()
        symptoms, risk_factors, precautions, management = [], [], [], []
        if disease_rec:
            try:
                symptoms = json.loads(disease_rec.symptoms)
                risk_factors = json.loads(disease_rec.risk_factors)
                precautions = json.loads(disease_rec.precautions)
                management = json.loads(disease_rec.management)
            except Exception:
                pass
        
        results.append(AnalysisResponse(
            analysis_id=a.id,
            is_rice_plant=True,
            condition=a.condition,
            confidence=a.confidence,
            severity=a.severity,
            affected_area_percentage=a.affected_area_percentage,
            symptoms=symptoms,
            risk_factors=risk_factors,
            precautions=precautions,
            management=management,
            model_version=a.model_version,
            is_demo=a.is_demo,
            expert_review_required=a.expert_review_required,
            image_url=a.image_url,
            created_at=a.created_at,
            field_id=a.field_id
        ))
    return results

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_by_id(analysis_id: int, db: Session = Depends(get_db)):
    a = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    disease_rec = db.query(Disease).filter(Disease.name == a.condition).first()
    symptoms, risk_factors, precautions, management = [], [], [], []
    if disease_rec:
        try:
            symptoms = json.loads(disease_rec.symptoms)
            risk_factors = json.loads(disease_rec.risk_factors)
            precautions = json.loads(disease_rec.precautions)
            management = json.loads(disease_rec.management)
        except Exception:
            pass

    return AnalysisResponse(
        analysis_id=a.id,
        is_rice_plant=True,
        condition=a.condition,
        confidence=a.confidence,
        severity=a.severity,
        affected_area_percentage=a.affected_area_percentage,
        symptoms=symptoms,
        risk_factors=risk_factors,
        precautions=precautions,
        management=management,
        model_version=a.model_version,
        is_demo=a.is_demo,
        expert_review_required=a.expert_review_required,
        image_url=a.image_url,
        created_at=a.created_at,
        field_id=a.field_id
    )
