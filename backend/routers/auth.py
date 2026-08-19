from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from models import User
from services.schemas import UserRegister, UserLogin
from services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed = hash_password(user.password)

    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed
    )

    try:
        db.add(new_user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Registration failed. Please try again")

    return {
        "message":"User Registered Successfully"
    }

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if db_user is None:

        return {
            "message":"User Not Found"
        }

    if not verify_password(
        user.password,
        db_user.password
    ):

        return {
            "message":"Invalid Password"
        }

    token = create_access_token(
        {
            "user_id":db_user.id
        }
    )

    return {
        "access_token":token,

        "token_type":"bearer"
    }