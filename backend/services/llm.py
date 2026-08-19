import json
import os
import urllib.error
import urllib.request

from config import GEMINI_API_KEY

# ── Gemini REST API (no SDK needed) ─────────────────────────────────────────
_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent?key={key}"
)


def _call_gemini(prompt: str) -> str | None:
    """Call Gemini REST API directly. Returns text or None on any failure."""
    if not GEMINI_API_KEY:
        return None
    url = _GEMINI_URL.format(key=GEMINI_API_KEY)
    payload = json.dumps(
        {"contents": [{"parts": [{"text": prompt}]}]}
    ).encode()
    req = urllib.request.Request(
        url, data=payload, headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as exc:
        err_body = exc.read().decode()
        os.environ["LLM_ERROR"] = err_body[:200]
        return None
    except Exception as exc:
        os.environ["LLM_ERROR"] = str(exc)
        return None


# ── Offline fallback knowledge base ─────────────────────────────────────────
_FALLBACK_KB = [
    (
        ["what is machine learning", "machine learning"],
        "Machine Learning (ML) is a subset of AI where computer systems learn from data "
        "to improve their performance without being explicitly programmed. Instead of "
        "following fixed rules, ML models find patterns in training data and use them to "
        "make predictions or decisions on new data. Examples include spam filters, "
        "recommendation systems, and image recognition."
    ),
    (
        ["what is deep learning", "deep learning"],
        "Deep Learning is a subset of machine learning that uses neural networks with many "
        "layers (hence 'deep') to learn representations of data. It excels at tasks like "
        "image recognition, speech recognition, and natural language processing. "
        "Popular frameworks include TensorFlow and PyTorch."
    ),
    (
        ["what is artificial intelligence", "what is ai"],
        "Artificial Intelligence (AI) is the field of creating computer systems that can "
        "perform tasks that normally require human intelligence — such as understanding "
        "language, recognizing images, learning from data, and making decisions."
    ),
    (
        ["what is python", "python programming"],
        "Python is a high-level, general-purpose programming language known for its clear "
        "syntax and readability. It is widely used in web development, data science, "
        "machine learning, automation, and scripting. Popular libraries include NumPy, "
        "Pandas, TensorFlow, and FastAPI."
    ),
    (
        ["what is neural network", "neural network"],
        "A Neural Network is a computational model inspired by the human brain. It consists "
        "of layers of interconnected nodes (neurons) that process input data and learn "
        "patterns through training. Neural networks are the backbone of deep learning and "
        "power applications like image recognition and language models."
    ),
    (
        ["what is nlp", "natural language processing"],
        "Natural Language Processing (NLP) is a branch of AI focused on enabling computers "
        "to understand, interpret, and generate human language. It powers applications like "
        "chatbots, translation, sentiment analysis, and search engines."
    ),
    (
        ["what is supervised learning", "supervised learning"],
        "Supervised Learning is a type of machine learning where a model is trained on "
        "labeled data — meaning each training example has a known correct output. The model "
        "learns to map inputs to outputs, and is then used to predict labels for new data. "
        "Examples: linear regression, decision trees, SVMs."
    ),
    (
        ["what is unsupervised learning", "unsupervised learning"],
        "Unsupervised Learning is a type of ML where the model finds patterns in data "
        "without labeled outputs. It's used for clustering (grouping similar items), "
        "dimensionality reduction, and anomaly detection. Examples: K-means, PCA."
    ),
    (
        ["what is a large language model", "what is llm", "large language model"],
        "A Large Language Model (LLM) is a type of AI model trained on massive amounts of "
        "text data to understand and generate human language. Examples include GPT-4, "
        "Gemini, and LLaMA. They power chatbots, code assistants, and content generation tools."
    ),
    (
        ["who are you", "what are you"],
        "I am Nix, an AI-powered study assistant. I can help you understand topics, "
        "answer questions, and analyze your PDF documents. Ask me anything!"
    ),
]


def _fallback_response(prompt: str) -> str:
    normalized = prompt.strip().lower()
    for keywords, answer in _FALLBACK_KB:
        if any(kw in normalized for kw in keywords):
            return answer
    return (
        "I'm sorry, I couldn't find a specific answer to your question. "
        "My Gemini AI connection is currently unavailable (quota exceeded). "
        "Please try again later, or ask about topics like Machine Learning, "
        "Deep Learning, Python, Neural Networks, or NLP."
    )


# ── Public API ───────────────────────────────────────────────────────────────
def ask_llm(prompt: str) -> str:
    """Try Gemini first, fall back to local knowledge base."""
    result = _call_gemini(prompt)
    if result:
        return result
    return _fallback_response(prompt)


# ── Chat history helpers ─────────────────────────────────────────────────────
from sqlalchemy.orm import Session
from models import ChatHistory


def save_message(db: Session, user_id, role, message):
    chat = ChatHistory(user_id=user_id, role=role, message=message)
    db.add(chat)
    db.commit()


def load_history(db: Session, user_id):
    return db.query(ChatHistory).filter(ChatHistory.user_id == user_id).all()


def history_to_text(history):
    return "".join(f"{item.role}: {item.message}\n" for item in history)

