from fastapi.testclient import TestClient

import app
import routers.chat as chat_router


client = TestClient(app.app)


def test_chat_returns_503_when_llm_fails(monkeypatch):
    def fake_ask_llm(prompt: str):
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    monkeypatch.setattr(chat_router, "ask_llm", fake_ask_llm)

    response = client.post("/chat", json={"message": "hello"})

    assert response.status_code == 503
    assert "GEMINI_API_KEY" in response.json()["detail"]
