from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str