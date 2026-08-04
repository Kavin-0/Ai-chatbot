from fastapi import APIRouter, UploadFile, File
import shutil
import os

from services.pdf_service import extract_text

router = APIRouter()


@router.post("/upload")
def upload_pdf(file: UploadFile = File(...)):
    upload_folder = "uploads"

    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(file_path)

    return {
        "message": "Uploaded Successfully",
        "filename": file.filename,
        "text": text,
    }