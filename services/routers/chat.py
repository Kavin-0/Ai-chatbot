from fastapi import APIRouter

from services.llm import ask_llm
from services.schemas import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    answer = ask_llm(request.message)
    return ChatResponse(response=answer)