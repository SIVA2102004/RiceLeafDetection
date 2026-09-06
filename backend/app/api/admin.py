import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import User, Analysis, Feedback, Disease, AIModelMeta, ExpertReview, UserRole, ReviewStatus
from app.schemas.all_schemas import AdminStats, DiseaseBase, DiseaseResponse, ExpertReviewCreate

router = APIRouter(prefix="/admin", tags=["Admin & Expert Portal"])

@router.get("/dashboard", response_model=AdminStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_farmers = db.query(User).filter(User.role == UserRole.FARMER).count()
    total_analyses = db.query(Analysis).count()
    healthy_cases = db.query(Analysis).filter(Analysis.condition == "Healthy").count()
    disease_cases = total_analyses - healthy_cases
    pending_reviews = db.query(Analysis).filter(Analysis.expert_review_required == True).count()
    total_feedback = db.query(Feedback).count()

    return AdminStats(
        total_farmers=total_farmers,
        total_analyses=total_analyses,
        disease_cases=disease_cases,
        healthy_cases=healthy_cases,
        pending_reviews=pending_reviews,
        total_feedback=total_feedback
    )

@router.get("/models")
def get_ai_models(db: Session = Depends(get_db)):
    return db.query(AIModelMeta).all()

@router.get("/reviews")
def get_pending_reviews(db: Session = Depends(get_db)):
    pending = db.query(Analysis).filter(Analysis.expert_review_required == True).all()
    return pending

@router.post("/reviews")
def submit_expert_review(review_in: ExpertReviewCreate, db: Session = Depends(get_db)):
    first_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    expert_id = first_admin.id if first_admin else 1

    review = ExpertReview(
        analysis_id=review_in.analysis_id,
        expert_id=expert_id,
        verified_condition=review_in.verified_condition,
        comments=review_in.comments,
        status="completed"
    )
    db.add(review)

    # Mark analysis as reviewed
    analysis = db.query(Analysis).filter(Analysis.id == review_in.analysis_id).first()
    if analysis:
        analysis.expert_review_required = False

    db.commit()
    return {"status": "success", "message": "Expert review saved and analysis flagged as verified."}
