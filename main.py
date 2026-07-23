from fastapi import FastAPI
from pydantic import BaseModel

from database import engine, SessionLocal
from models import Base, Student
from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from database import SessionLocal, engine, get_db
app = FastAPI()

@app.get("/")
def home():
    return {"message": "Hello World"}

# Create database tables
Base.metadata.create_all(bind=engine)

 

# Pydantic Model (Request Model)
class StudentRequest(BaseModel):
    name: str
    age: int
    department: str


# Home Endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to Student API"
    }


# About Endpoint
@app.get("/about")
def about():
    return {
        "developer": "Sanjai",
        "goal": "Become AI/ML Engineer"
    }


# Add Student
@app.post("/students")
def add_student(student: StudentRequest):

    db = SessionLocal()

    new_student = Student(
        name=student.name,
        age=student.age,
        department=student.department
    )

    db.add(new_student)

    db.commit()

    db.refresh(new_student)

    db.close()

    return {
        "message": "Student Added Successfully",
        "student": new_student.id
    }


# Get All Students
@app.get("/students")
def get_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return students 
    


# Get One Student
@app.get("/students/{student_id}")
def get_student(student_id: int):

    db = SessionLocal()

    student = db.query(Student).filter(Student.id == student_id).first()

    db.close()

    return student

# Delete Student
@app.delete("/students/{student_id}")
def delete_student(student_id: int):

    db = SessionLocal()

    student = db.query(Student).filter(Student.id == student_id).first()

    db.delete(student)

    db.commit()

    db.close()

    return {
        "message": "Student Deleted Successfully"
    }
from database import engine
from models import Base

Base.metadata.create_all(bind=engine)
from routers.chat import router as chat_router

app.include_router(chat_router)