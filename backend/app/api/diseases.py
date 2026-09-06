import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Disease
from app.schemas.all_schemas import DiseaseResponse

router = APIRouter(prefix="/diseases", tags=["Disease Knowledge Base"])

@router.get("", response_model=List[DiseaseResponse])
def get_all_diseases(db: Session = Depends(get_db)):
    diseases = db.query(Disease).all()
    results = []
    for d in diseases:
        try:
            symptoms = json.loads(d.symptoms)
            risk_factors = json.loads(d.risk_factors)
            precautions = json.loads(d.precautions)
            management = json.loads(d.management)
        except Exception:
            symptoms = [d.symptoms]
            risk_factors = [d.risk_factors]
            precautions = [d.precautions]
            management = [d.management]

        results.append(DiseaseResponse(
            id=d.id,
            name=d.name,
            scientific_name=d.scientific_name,
            description=d.description,
            symptoms=symptoms,
            risk_factors=risk_factors,
            precautions=precautions,
            management=management,
            source=d.source,
            region=d.region,
            status=d.status,
            created_by=d.created_by,
            reviewed_at=d.reviewed_at,
            created_at=d.created_at
        ))
    return results

@router.get("/{disease_id}", response_model=DiseaseResponse)
def get_disease(disease_id: int, db: Session = Depends(get_db)):
    d = db.query(Disease).filter(Disease.id == disease_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Disease record not found.")

    try:
        symptoms = json.loads(d.symptoms)
        risk_factors = json.loads(d.risk_factors)
        precautions = json.loads(d.precautions)
        management = json.loads(d.management)
    except Exception:
        symptoms = [d.symptoms]
        risk_factors = [d.risk_factors]
        precautions = [d.precautions]
        management = [d.management]

    return DiseaseResponse(
        id=d.id,
        name=d.name,
        scientific_name=d.scientific_name,
        description=d.description,
        symptoms=symptoms,
        risk_factors=risk_factors,
        precautions=precautions,
        management=management,
        source=d.source,
        region=d.region,
        status=d.status,
        created_by=d.created_by,
        reviewed_at=d.reviewed_at,
        created_at=d.created_at
    )
