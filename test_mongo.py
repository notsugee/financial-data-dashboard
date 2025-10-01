from pymongo import MongoClient

# Use 127.0.0.1 instead of localhost
client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["newsch_db"]

print("✅ Databases:", client.list_database_names())
