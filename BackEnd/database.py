from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")  # Fetch the URI from environment variables

client = MongoClient(MONGO_URI)
db = client["mydatabase"]
users_collection = db["users"]


# Test connection
def test_connection():
    try:
        client.admin.command('ping')
        print("Connected to MongoDB!")
    except Exception as e:
        print(f"Connection failed: {e}")
