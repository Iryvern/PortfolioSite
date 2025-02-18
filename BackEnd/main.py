
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from bson.objectid import ObjectId
from database import users_collection, client  # Import MongoDB client
from fastapi.middleware.cors import CORSMiddleware
from cryptography.fernet import Fernet
import os

# Initialize FastAPI
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (or specify frontend URL)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Pydantic models
class UserCreate(BaseModel):
    username: str
    password: str
    email: str

class UserResponse(BaseModel):
    id: str
    username: str

def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"]
    }

# Encryption setup
# Key should be stored securely, not hardcoded. For demonstration purposes, we generate a key.
encryption_key = os.environ.get("ENCRYPTION_KEY") or Fernet.generate_key()
cipher = Fernet(encryption_key)

# Helper function to encrypt data
def encrypt(data: str) -> str:
    return cipher.encrypt(data.encode()).decode()

# Helper function to decrypt data
def decrypt(data: str) -> str:
    return cipher.decrypt(data.encode()).decode()

@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    new_user = {
        "username": encrypt(user.username),
        "email": encrypt(user.email),
        "password": encrypt(user.password)
    }
    result = users_collection.insert_one(new_user)
    created_user = users_collection.find_one({"_id": result.inserted_id})
    # Return the decrypted username for response
    created_user["username"] = decrypt(created_user["username"])
    return user_helper(created_user)

@app.post("/login")
def login_user(user: UserCreate):
    db_user = users_collection.find_one({
        "username": encrypt(user.username),
        "password": encrypt(user.password)
    })
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Return the decrypted username for response
    db_user["username"] = decrypt(db_user["username"])
    return {"message": "Login successful", "user": user_helper(db_user)}

@app.get("/")
def home():
    try:
        client.admin.command('ping')  # Test MongoDB connection
        return {"message": "Hello from FastAPI and MongoDB!", "status": "MongoDB connected successfully"}
    except Exception as e:
        return {"message": "Hello from FastAPI!", "status": f"MongoDB connection failed: {e}"}