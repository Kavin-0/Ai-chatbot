from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from database import get_db
from models import ChatHistory
from services.current_user import get_current_user
from services.llm import ask_llm
from services.schemas import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: int = Depends(get_current_user),
):
    answer = ask_llm(request.message)
    return ChatResponse(response=answer)


@router.post("/upload")
def upload_pdf(
    file: UploadFile = File(...),
    current_user: int = Depends(get_current_user),
):
    # Placeholder upload route. Add real upload handling here.
    return {
        "message": "File uploaded successfully.",
        "filename": file.filename,
        "user_id": current_user,
    }


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    history = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user
    ).all()
    return history


@router.delete("/history")
def clear_history(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user
    ).delete()
    db.commit()
    return {"message": "History Deleted"}
