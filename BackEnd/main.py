from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from bson.objectid import ObjectId
from database import users_collection, client
from fastapi.middleware.cors import CORSMiddleware
import os
import hashlib
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    username: str
    password: str
    email: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str

def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"]
    }

def hash_sha256(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()

@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate):
    if users_collection.find_one({"username": hash_sha256(user.username)}):
        raise HTTPException(status_code=400, detail="Username already exists")
    if users_collection.find_one({"email": hash_sha256(user.email)}):
        raise HTTPException(status_code=400, detail="Email already exists")
    new_user = {
        "username": hash_sha256(user.username),
        "email": hash_sha256(user.email),
        "password": hash_sha256(user.password)
    }
    result = users_collection.insert_one(new_user)
    created_user = users_collection.find_one({"_id": result.inserted_id})
    return user_helper(created_user)

@app.post("/login")
def login_user(user: UserLogin):
    db_user = users_collection.find_one({"username": hash_sha256(user.username)})
    if not db_user:
        raise HTTPException(status_code=404, detail="User does not exist")
    if db_user["password"] != hash_sha256(user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user": user_helper(db_user)}

@app.get("/")
def home():
    try:
        client.admin.command('ping')
        return {"message": "Hello from FastAPI and MongoDB!", "status": "MongoDB connected successfully"}
    except Exception as e:
        return {"message": "Hello from FastAPI!", "status": f"MongoDB connection failed: {e}"}