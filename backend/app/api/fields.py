from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Field, User, Analysis
from app.schemas.all_schemas import FieldCreate, FieldResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/fields", tags=["Farmer Fields"])

@router.get("", response_model=List[FieldResponse])
def get_fields(db: Session = Depends(get_db)):
    fields = db.query(Field).order_by(Field.created_at.desc()).all()
    return fields

@router.post("", response_model=FieldResponse)
def create_field(
    field_in: FieldCreate,
    db: Session = Depends(get_db)
):
    # Default to first user or demo farmer
    first_user = db.query(User).first()
    user_id = first_user.id if first_user else 1

    field = Field(
        user_id=user_id,
        name=field_in.name,
        village=field_in.village,
        area=field_in.area,
        area_unit=field_in.area_unit,
        variety=field_in.variety,
        planting_date=field_in.planting_date,
        harvest_date=field_in.harvest_date,
        notes=field_in.notes
    )
    db.add(field)
    db.commit()
    db.refresh(field)
    return field

@router.get("/{field_id}", response_model=FieldResponse)
def get_field(field_id: int, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found.")
    return field

@router.delete("/{field_id}")
def delete_field(field_id: int, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found.")
    db.delete(field)
    db.commit()
    return {"message": "Field deleted successfully"}
