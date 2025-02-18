from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from bson.objectid import ObjectId
from database import users_collection, client  # Import MongoDB client
from fastapi.middleware.cors import CORSMiddleware

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

class UserResponse(BaseModel):
    id: str
    username: str

def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"]
    }

@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    new_user = {"username": user.username, "password": user.password}
    result = users_collection.insert_one(new_user)
    created_user = users_collection.find_one({"_id": result.inserted_id})
    return user_helper(created_user)

@app.post("/login")
def login_user(user: UserCreate):
    db_user = users_collection.find_one({"username": user.username, "password": user.password})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user": user_helper(db_user)}

@app.get("/")
def home():
    try:
        client.admin.command('ping')  # Test MongoDB connection
        return {"message": "Hello from FastAPI and MongoDB!", "status": "MongoDB connected successfully"}
    except Exception as e:
        return {"message": "Hello from FastAPI!", "status": f"MongoDB connection failed: {e}"}
