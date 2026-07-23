from fastapi import APIRouter

from schemas import ChatRequest, ChatResponse
from services.llm import ask_llm

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    answer = ask_llm(request.message)

    return ChatResponse(
        response=answer
    )