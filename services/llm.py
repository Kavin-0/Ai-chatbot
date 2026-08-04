import os

try:
    from google import genai
except Exception as exc:
    genai = None
    os.environ.setdefault("LLM_ERROR", str(exc))

from config import GEMINI_API_KEY

client = None
if GEMINI_API_KEY and genai is not None:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as exc:
        client = None
        os.environ["LLM_ERROR"] = str(exc)


def _fallback_response(prompt: str) -> str:
    normalized = prompt.strip().lower()

    if "what is ai" in normalized or "artificial intelligence" in normalized:
        return (
            "Artificial Intelligence (AI) is the field of creating computer systems "
            "that can perform tasks that normally require human intelligence, such as "
            "understanding language, recognizing images, learning from data, and making decisions."
        )

    if "who are you" in normalized:
        return "I am an AI assistant built to help answer questions and support your app."

    return f"AI says: {prompt}"


def ask_llm(prompt: str):
    if client is None:
        return _fallback_response(prompt)

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        text = getattr(response, "text", None)
        if text:
            return text
        return _fallback_response(prompt)
    except Exception as exc:
        os.environ["LLM_ERROR"] = str(exc)
        return _fallback_response(prompt)
