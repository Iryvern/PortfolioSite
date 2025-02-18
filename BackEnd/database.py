from pymongo import MongoClient

# Replace with your MongoDB connection string
MONGO_URI = "mongodb+srv://iryvern:kTNuv6ZUpY5DItS3@mongocluster.iccjm.mongodb.net/"

client = MongoClient(MONGO_URI)
db = client["mydatabase"]  # Create or connect to the database
users_collection = db["users"]  # Create or connect to the users collection

# Test connection
def test_connection():
    try:
        client.admin.command('ping')
        print("Connected to MongoDB!")
    except Exception as e:
        print(f"Connection failed: {e}")
