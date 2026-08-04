from fastapi.testclient import TestClient

from main import app
from services import llm

client = TestClient(app)


def test_home():
    response = client.get("/")
    assert response.status_code == 200


def test_chat_endpoint():
    response = client.post(
        "/chat",
        json={"message": "hello"},
    )
    assert response.status_code == 200
    assert "AI says" in response.json()["response"]


def test_llm_module_imports_and_falls_back():
    response = llm.ask_llm("hello")
    assert isinstance(response, str)
    assert response
from services.chunk_service import chunk_text

text = "A" * 1200

chunks = chunk_text(text)

print("Number of chunks:", len(chunks))

for i, chunk in enumerate(chunks):
    print(f"Chunk {i+1}: {len(chunk)}")

from services.embedding_services import create_embedding

text = "Machine Learning"

embedding = create_embedding(text)

print(type(embedding))
print(len(embedding))
print(embedding[:10])   # Show first 10 values    