import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

db_client = MongoClient(os.getenv("MONGODB_URI")).matchtest