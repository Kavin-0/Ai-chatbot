# AI Chatbot — Nix

An AI-powered study assistant built with **FastAPI** (backend) and **React + Vite** (frontend).

## Project Structure

```
AI-chatbot/
├── backend/                  # FastAPI backend
│   ├── main.py               # App entry point
│   ├── config.py             # Environment config (API keys, JWT settings)
│   ├── database.py           # SQLAlchemy DB setup
│   ├── models.py             # DB models (Student, User)
│   ├── schemas.py            # Pydantic schemas
│   ├── app.py                # App factory (optional)
│   ├── .env                  # Environment variables (not committed)
│   ├── student.db            # SQLite database
│   ├── routers/              # API route handlers
│   │   ├── auth.py           # Register / Login
│   │   ├── chat.py           # Chat endpoint
│   │   └── upload.py         # PDF upload
│   ├── services/             # Business logic
│   │   ├── auth_service.py   # Password hashing, JWT
│   │   ├── current_user.py   # JWT auth dependency
│   │   ├── llm.py            # Gemini AI integration
│   │   ├── pdf_service.py    # PDF text extraction
│   │   ├── chunk_service.py  # Text chunking
│   │   ├── embedding_services.py
│   │   ├── vector_service.py
│   │   └── schemas.py
│   ├── tests/
│   │   └── test_chat.py
│   └── uploads/              # Uploaded PDF files
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx           # Main app component
│   │   └── App.css
│   ├── index.html
│   ├── vite.config.js        # Vite + proxy config
│   └── package.json
│
├── .venv/                    # Python virtual environment
└── .gitignore
```

## How to Run

### 1. Backend

```bash
cd backend
python main.py
```

Runs on: **http://127.0.0.1:8000**
API docs: **http://127.0.0.1:8000/docs**

### 2. Frontend

```bash
cd frontend
npm run dev
```

Runs on: **http://localhost:5173** (or next available port)

## Requirements

- Python 3.12+
- Node.js 18+
- A `GEMINI_API_KEY` in `backend/.env`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8 |
| Backend | FastAPI, Uvicorn |
| Database | SQLite + SQLAlchemy |
| Auth | JWT (python-jose) + bcrypt 4.0.1 |
| AI | Google Gemini API |
| PDF | PyMuPDF / pdfplumber |
