from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import DeclarativeBase
 

class Base(DeclarativeBase):
    pass


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    department = Column(String)


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer)

    role = Column(String)

    message = Column(String)


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True)

    email = Column(String, unique=True)

    password = Column(String)