from pymongo import MongoClient
from datetime import datetime

class MongoWriter:
    def __init__(self, uri="mongodb://localhost:27017", db_name="BNP_DB"):
        self.client = MongoClient(uri)
        self.db = self.client[db_name]

        self.collection_map = {
            "credit": "Customer_Credit_Card_Transactions",
            "upi": "Customer_UPI_Transactions",
            "retail": "Customer_Retails_Transactions",
            "trade": "Customer_Trade",
            "customer": "Customer",
            "audit": "Audit",
            "error_records":"Error_Records"
        }

    def get_collection(self, file_name: str):
        for key, collection in self.collection_map.items():
            if key.lower() in file_name.lower():
                return self.db[collection]
        raise ValueError(f"No collection mapping found for {file_name}")

    def insert_records(self, collection_name: str, records: list):
        if not records:
            return {"status": "no records to insert"}
        result = self.db[collection_name].insert_many(records)
        return {"status": "success", "inserted_count": len(result.inserted_ids)}

    def insert_audit(self, file_name: str, success_count: int, error_count: int):
        audit_doc = {
            "file_name": file_name,
            "timestamp": datetime.utcnow(),
            "success_count": success_count,
            "error_count": error_count
        }
        self.db["Audit"].insert_one(audit_doc)
