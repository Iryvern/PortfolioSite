from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from database import users_collection, client
from fastapi.middleware.cors import CORSMiddleware
import os
import hashlib
from dotenv import load_dotenv
import jwt
import datetime
from fastapi.security import OAuth2PasswordBearer
from models import generate_response  
from fastapi import UploadFile, File, Form
from pdf2image import convert_from_bytes
import base64
import io

# uvicorn main:app --reload
# uvicorn main:app --reload --log-level debug


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

class LLMRequest(BaseModel):
    prompt: str

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
    
@app.get("/")
def home():
    try:
        client.admin.command('ping')
        return {"message": "Hello from FastAPI and MongoDB!", "status": "MongoDB connected successfully"}
    except Exception as e:
        return {"message": "Hello from FastAPI!", "status": f"MongoDB connection failed: {e}"}

@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate):
    if users_collection.find_one({"username": hash_sha256(user.username)}):
        raise HTTPException(status_code=400, detail="Username already exists")
    if users_collection.find_one({"email": hash_sha256(user.email)}):
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = {
        "username": hash_sha256(user.username),
        "email": hash_sha256(user.email),
        "password": hash_sha256(user.password),
        "role": "user",
        "Files": {
            "Books": {}  # Initialize as empty dictionary
        }
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
    
    # Extract user role (defaults to "User" if not found)
    user_role = db_user.get("role", "User")

    # Generate JWT token
    token = create_access_token({"sub": user.username})

    return {
        "message": "Login successful",
        "user": user_helper(db_user),
        "role": user_role,
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

@app.post("/generate")
def generate_text(request: LLMRequest):
    """Endpoint to generate text using the Hugging Face API."""
    response = generate_response(request.prompt)
    if "Error" in response:
        raise HTTPException(status_code=500, detail=response)
    return {"response": response}


@app.post("/user/books/upload")
async def upload_book(
    file: UploadFile = File(...),
    book_name: str = Form(...),
    username: str = Depends(verify_token)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    user_query = {"username": hash_sha256(username)}
    user = users_collection.find_one(user_query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    pdf_data = await file.read()
    images = convert_from_bytes(pdf_data)
    pages_base64 = []

    for image in images:
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)
        encoded = base64.b64encode(buffer.read()).decode("utf-8")
        pages_base64.append(f"data:image/png;base64,{encoded}")

    users_collection.update_one(
        user_query,
        {"$set": {f"Files.Books.{book_name}": pages_base64}}
    )

    return {"detail": "Book uploaded successfully", "pages": len(pages_base64)}


@app.get("/user/books")
def get_books(username: str = Depends(verify_token)):
    user = users_collection.find_one({"username": hash_sha256(username)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.get("Files", {}).get("Books", {})

@app.delete("/user/books/{book_name}")
def delete_book(book_name: str, username: str = Depends(verify_token)):
    result = users_collection.update_one(
        {"username": hash_sha256(username)},
        {"$unset": {f"Files.Books.{book_name}": ""}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Book not found or already removed")
    return {"detail": f"'{book_name}' removed successfully"}
