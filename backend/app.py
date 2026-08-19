"""ASGI entry point for running the Student API from the project root."""

import sys
from pathlib import Path

from dotenv import load_dotenv

PROJECT_DIR = Path(__file__).resolve().parent / "Ai-chatbot"
sys.path.insert(0, str(PROJECT_DIR))
load_dotenv(PROJECT_DIR / ".env")

from main import app  # noqa: E402
