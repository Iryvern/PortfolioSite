from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from bson.objectid import ObjectId
from database import users_collection, client
from fastapi.middleware.cors import CORSMiddleware
import os
import hashlib
from dotenv import load_dotenv
import jwt
import datetime
from fastapi.security import OAuth2PasswordBearer

# uvicorn main:app --reload

load_dotenv()

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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

class UserUpdateEmail(BaseModel):
    email: str

class UserUpdatePassword(BaseModel):
    old_password: str
    new_password: str

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

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: int = 24):
    """Generate JWT token with an expiration time of 24 hours"""
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

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
    
    # Generate JWT token
    token = create_access_token({"sub": user.username})

    return {
        "message": "Login successful",
        "user": user_helper(db_user),
        "access_token": token,
        "token_type": "bearer"
    }

@app.post("/update-email")
def update_email(user: UserUpdateEmail, username: str = Depends(verify_token)):
    users_collection.update_one({"username": hash_sha256(username)}, {"$set": {"email": hash_sha256(user.email)}})
    return {"message": "Email updated successfully"}

@app.post("/update-password")
def update_password(user: UserUpdatePassword, username: str = Depends(verify_token)):
    db_user = users_collection.find_one({"username": hash_sha256(username)})
    if not db_user or db_user["password"] != hash_sha256(user.old_password):
        raise HTTPException(status_code=401, detail="Invalid old password")
    users_collection.update_one({"username": hash_sha256(username)}, {"$set": {"password": hash_sha256(user.new_password)}})
    return {"message": "Password updated successfully"}

@app.get("/")
def home():
    try:
        client.admin.command('ping')
        return {"message": "Hello from FastAPI and MongoDB!", "status": "MongoDB connected successfully"}
    except Exception as e:
        return {"message": "Hello from FastAPI!", "status": f"MongoDB connection failed: {e}"}
