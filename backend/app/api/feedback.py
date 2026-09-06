from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Feedback, Analysis, User
from app.schemas.all_schemas import FeedbackCreate

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("")
def submit_feedback(fb_in: FeedbackCreate, db: Session = Depends(get_db)):
    first_user = db.query(User).first()
    user_id = first_user.id if first_user else 1

    feedback = Feedback(
        analysis_id=fb_in.analysis_id,
        user_id=user_id,
        rating=fb_in.rating,
        comment=fb_in.comment
    )
    db.add(feedback)
    db.commit()
    return {"status": "success", "message": "Thank you for your feedback! It helps improve our model accuracy."}
