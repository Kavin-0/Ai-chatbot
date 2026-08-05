from pathlib import Path
import sys
from importlib.util import module_from_spec, spec_from_file_location

PROJECT_DIR = Path(__file__).resolve().parent / "Ai-chatbot"
sys.path.insert(0, str(PROJECT_DIR))

spec = spec_from_file_location("ai_chatbot_main", PROJECT_DIR / "main.py")
ai_chatbot_main = module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(ai_chatbot_main)

app = ai_chatbot_main.app
