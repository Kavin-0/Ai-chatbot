from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal, engine, get_db
from models import Base, Student
from services.routers.chat import router as chat_router
from services.routers.upload import router as upload_router

app = FastAPI()

Base.metadata.create_all(bind=engine)


class StudentRequest(BaseModel):
    name: str
    age: int
    department: str


@app.get("/")
def home():
    return {"message": "Welcome to Student API"}


@app.get("/about")
def about():
    return {
        "developer": "Sanjai",
        "goal": "Become AI/ML Engineer",
    }


@app.post("/students")
def add_student(student: StudentRequest):
    db = SessionLocal()
    try:
        new_student = Student(
            name=student.name,
            age=student.age,
            department=student.department,
        )
        db.add(new_student)
        db.commit()
        db.refresh(new_student)
        return {
            "message": "Student Added Successfully",
            "student": new_student.id,
        }
    finally:
        db.close()


@app.get("/students")
def get_students(db: Session = Depends(get_db)):
    return db.query(Student).all()


@app.get("/students/{student_id}")
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return {"message": "Student Deleted Successfully"}


app.include_router(chat_router)
app.include_router(upload_router)


def run_server() -> None:
    import uvicorn

    host = "127.0.0.1"
    ports = [8000, 8001, 8002, 8003]

    for port in ports:
        try:
            uvicorn.run("main:app", host=host, port=port, reload=False)
            return
        except OSError as exc:
            if "10013" in str(exc) and port != ports[-1]:
                print(f"Port {port} is not available, trying {port + 1}...")
                continue
            raise


if __name__ == "__main__":
    run_server()
