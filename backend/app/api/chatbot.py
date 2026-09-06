from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import ChatSession, ChatMessage, Analysis, User
from app.schemas.all_schemas import ChatMessageCreate, ChatMessageResponse, ChatSessionResponse
from app.chatbot.rag_assistant import FarmerAssistantRAG
from app.api.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["Farmer Assistant"])

@router.post("/message", response_model=ChatMessageResponse)
def send_message(
    chat_in: ChatMessageCreate,
    db: Session = Depends(get_db)
):
    # Find or create anonymous / default session
    session = db.query(ChatSession).order_by(ChatSession.updated_at.desc()).first()
    if not session:
        session = ChatSession(title="Field Health Assistance")
        db.add(session)
        db.commit()
        db.refresh(session)

    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        message=chat_in.message,
        language=chat_in.language
    )
    db.add(user_msg)
    db.commit()

    # Diagnosis context if provided
    analysis_context = None
    if chat_in.analysis_id:
        analysis_context = db.query(Analysis).filter(Analysis.id == chat_in.analysis_id).first()

    # RAG assistant response
    rag = FarmerAssistantRAG(db)
    assistant_reply_text = rag.generate_response(
        query=chat_in.message,
        language=chat_in.language,
        analysis_context=analysis_context
    )

    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        message=assistant_reply_text,
        language=chat_in.language
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_chat_sessions(db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).order_by(ChatSession.updated_at.desc()).all()
    return sessions

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_chat_session_by_id(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")
    return session
