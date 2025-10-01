from flask import Flask, request, jsonify
from bson import json_util
import pandas as pd
import json
import xml.etree.ElementTree as ET
import pdfplumber
import os
import os
from factory import ParserFactory
from mongo_writer import MongoWriter
from flask_cors import CORS
from datetime import datetime
from pydantic import ValidationError
from validators.credit_card_transactions import CustomerCreditCardModel
from validators.customers import CustomerModel
from validators.retail_transactions import CustomerRetailModel
from validators.trade_transactions import CustomerTradeModel
from validators.upi_transactions import CustomerUPIModel


app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
CORS(app)

# def convert_oid_to_str(obj):
#     """
#     Recursively converts {"$oid": "..."} objects to string in nested dicts/lists.
#     """
#     if isinstance(obj, dict):
#         # Check if this dict is an ObjectID representation
#         if "$oid" in obj and len(obj) == 1:
#             return obj["$oid"]
#         # Otherwise, recurse into the dict
#         return {k: convert_oid_to_str(v) for k, v in obj.items()}
#     elif isinstance(obj, list):
#         return [convert_oid_to_str(i) for i in obj]
#     else:
#         return obj

MODEL_MAPPING = {
    "Customer_Credit_Card_Transactions": CustomerCreditCardModel,
    "Customer": CustomerModel,
    "Customer_Retails_Transactions": CustomerRetailModel,
    "Customer_Trade": CustomerTradeModel,
    "Customer_UPI_Transactions": CustomerUPIModel
}

def remove_inner_ids(data):
    """Recursively remove '_id' fields from dicts and lists"""
    if isinstance(data, dict):
        data.pop("_id", None)
        for k, v in data.items():
            data[k] = remove_inner_ids(v)
    elif isinstance(data, list):
        data = [remove_inner_ids(item) for item in data]
    return data



def parse_file(ext, file_path: str):
    # ext = os.path.splitext(file_path)[-1].lstrip(".").lower()
    parser = ParserFactory.get_parser(ext)
    return parser.parse(file_path)


FILE_COLLECTION_MAP = {
    "upi": "Customer_UPI_Transactions",
    "credit": "Customer_Credit_Card_Transactions",
    "trade": "Customer_Trade",
    "retail": "Customer_Retails_Transactions",
    "customer": "Customer",
    "audit": "Audit",
    "error": "Error_Log"
}


def get_collection_from_file(file_path: str) -> str:
    """Map file name keywords → MongoDB collection"""
    file_name = os.path.basename(file_path).lower()
    for key, collection in FILE_COLLECTION_MAP.items():
        if key in file_name:
            return collection
    raise ValueError(f"No matching collection found for file: {file_name}")


def keys_to_lower(obj):
        """Recursively convert dict keys to lowercase"""
        if isinstance(obj, dict):
            return {str(k).lower(): keys_to_lower(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [keys_to_lower(i) for i in obj]
        else:
            return obj

def store_in_mongo_warehouse_tables(file_path: str, parsed_data):
    
    file_name = os.path.basename(file_path)
    # Convert keys to lowercase
    parsed_data_lower = [keys_to_lower(record) for record in parsed_data]
    
    parsed_data_lower = [remove_inner_ids(record) for record in parsed_data_lower]
    collection = get_collection_from_file(file_path)
    model_cls = MODEL_MAPPING[collection]
    if collection not in MODEL_MAPPING:
        raise ValueError(f"No validator mapped for {file_name}")
    # Remove _id if exists (to avoid duplicate key error)
    for record in parsed_data_lower:
        record.pop("_id", None)
    results = {"file": file_name, "success": 0, "errors": 0, "error_records": [], "correct_records":[]}
    for idx, record in enumerate(parsed_data_lower, start=1):
        try:
            model_cls(**record)
            results["success"] += 1
            results["correct_records"].append(
                # "record_number": idx,
                record
            )
        except ValidationError as e:
            
            invalid_fields = [err["loc"][0] for err in e.errors()]
            results["errors"] += 1
            results["error_records"].append({
                # "record_number": idx,
                "filename": file_name,
                "record": record,
                "invalid_fields": invalid_fields,
                "errors": e.errors()
            })
    # return results
    
    # for record in results["correct_records"]:
    #     record.pop("_id", None)
        
    # for record in results["error_records"]:
    #     record.pop("_id", None)
    """Insert parsed records into MongoDB"""
    collection_name = get_collection_from_file(file_path)
    mongo = MongoWriter()
    mongo.insert_records(collection_name, results["correct_records"])
    mongo.insert_records("Error_Records", results["error_records"])
    print(f"✅ Inserted {len(results["correct_records"])} records into '{collection_name}'")
    return collection_name, results["correct_records"], len(results["correct_records"]), len(results["error_records"])


# def store_in_mongo(file_path: str, parsed_data):
    
#      # Convert keys to lowercase
#     parsed_data_lower = [keys_to_lower(record) for record in parsed_data]

#     # Remove _id if exists (to avoid duplicate key error)
#     for record in parsed_data_lower:
#         record.pop("_id", None)
    
#     """Insert parsed records into MongoDB (target + customer-centric Data Mart House)"""
#     collection_name = get_collection_from_file(file_path)
#     mongo = MongoWriter()

#     # Insert into target collection
#     mongo.insert_records(collection_name, parsed_data_lower)

#     # Insert into Data Mart House grouped by customer_id
#     data_mart = mongo.db["Customer"]

#     for record in parsed_data:
#         customer_id = record.get("customer_id")
#         if not customer_id:
#             continue  # skip if no customer id

#         # Remove customer_id from the record copy to avoid duplication inside arrays
#         record_copy = {k: v for k, v in record.items() if k != "customer_id"}

#         # Push record under the correct transaction type for that customer
#         data_mart.update_one(
#             {"customer_id": customer_id},
#             {
#                 "$push": {f"transactions.{collection_name}": record_copy}
#             },
#             upsert=True
#         )

#     print(f"✅ Inserted {len(parsed_data)} into '{collection_name}' and Data Mart House (by customer)")
#     return collection_name, len(parsed_data)


def store_in_mongo_data_mart(file_path: str, parsed_data: list):
    """Insert parsed records into Data Mart collection grouped by customer_id"""

    # Step 1: detect which collection type this data came from
    collection_name = get_collection_from_file(file_path)
    mongo = MongoWriter()

    data_mart_collection = "Customer"

    for record in parsed_data:
        customer_id = record.get("Customer_ID") or record.get("customer_id") or record.get("CUST_ID") or record.get("cust_id")
        if not customer_id:
            print("⚠️ Skipping record: no Customer_ID found")
            continue

        # Step 2: Insert into the unified DataMart structure
        mongo.db[data_mart_collection].update_one(
            {"customer_id": customer_id},
            {
                "$push": {f"collections.{collection_name}": record}
            },
            upsert=True
        )

    print(f"✅ Inserted {len(parsed_data)} records into Data Mart under '{collection_name}'")
    return collection_name, len(parsed_data)


# def parse_csv(file_path):
#     """Parse CSV file using pandas"""
#     df = pd.read_csv(file_path)
#     return df.to_dict(orient="records")


# def parse_excel(file_path):
#     """Parse Excel file (.xlsx) using pandas"""
#     df = pd.read_excel(file_path)
#     return df.to_dict(orient="records")


# def parse_json(file_path):
#     """Parse JSON file"""
#     with open(file_path, "r", encoding="utf-8") as f:
#         data = json.load(f)
#     return data


# def parse_xml(file_path):
#     """Parse XML file into list of dicts"""
#     tree = ET.parse(file_path)
#     root = tree.getroot()

#     parsed_data = []
#     for child in root:
#         record = {elem.tag: elem.text for elem in child}
#         parsed_data.append(record)
#     return parsed_data


# def parse_pdf(file_path):
#     """Extract text from PDF file using pdfplumber"""
#     parsed_data = []
#     with pdfplumber.open(file_path) as pdf:
#         for i, page in enumerate(pdf.pages):
#             text = page.extract_text()
#             parsed_data.append({"page": i + 1, "text": text})
#     return parsed_data


@app.route("/upload", methods=["POST"])
def upload_file():
    """Upload and parse file based on extension"""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(file_path)

    # Determine file type by extension
    ext = file.filename.rsplit(".", 1)[-1].lower()
    
    results = {"file": file.filename, "success": 0, "errors": 0, "error_details": []}

    try:
        # if ext == "csv":
        #     parsed = parse_csv(file_path)
        # elif ext in ["xls", "xlsx"]:
        #     parsed = parse_excel(file_path)
        # elif ext == "json":
        #     parsed = parse_json(file_path)
        # elif ext == "xml":
        #     parsed = parse_xml(file_path)
        # elif ext == "pdf":
        #     parsed = parse_pdf(file_path)
        # else:
        #     return jsonify({"error": f"Unsupported file type: {ext}"}), 400
        parsed = parse_file(ext, file_path)
        #print(parsed)
        collection_name, correct_records, correct_count, error_count = store_in_mongo_warehouse_tables(file_path, parsed)
        collection_name, inserted_count = store_in_mongo_data_mart(file_path, correct_records)
        
        audit_record = {
            "audit_id": get_next_audit_id(), 
            "file_name": file.filename,
            "file_type": ext.upper(),
            "file_size": round(os.path.getsize(file_path) / (1024 * 1024), 2),  # in MB
            "status": "SUCCESS",
            "processed_rows": len(parsed),
            "error_rows": error_count,  # implement function if needed
            "comments": "File processed successfully",
            "started_at": datetime.now().isoformat(),  # you can track actual start & end if needed
            "finished_at": datetime.now().isoformat()
        }

        mongo = MongoWriter()
        # Insert audit record into MongoDB
        mongo.db["Audit"].insert_one(audit_record)
        return jsonify({
            "status": "success"
        }), 200

    # # except Exception as e:
    # #     return jsonify({
    # #         "status": "error"
    # #     }), 500
    # #     # Create audit record
        
    #     return jsonify(), 202

    except Exception as e:
        mongo = MongoWriter()
        mongo.db["Audit"].insert_one({
            "audit_id": get_next_audit_id(),
            "file_name": file.filename,
            "file_type": ext.upper(),
            "file_size": None,  # in MB,
            "processed_rows": None,
            "error_rows": None,
            "status": "FAILED",
            "comments": str(e),
            "started_at": datetime.now().isoformat(),
            "finished_at": datetime.now().isoformat()
        })
        return jsonify({"error": str(e)}), 500


def get_next_audit_id():
    mongo = MongoWriter()
        
    last = mongo.db["Audit"].find_one(sort=[("audit_id", -1)])
    return (last["audit_id"] + 1) if last else 1001

def count_errors(parsed_data):
    return sum(1 for row in parsed_data if row.get("error"))


@app.route("/fetch", methods=["GET"])
def fetch_all_customer_data():
    try:
        mongo = MongoWriter()
        data_mart = mongo.db["Customer"]

        # Query by customer_id
        customer_doc = data_mart.find({})

        # if not customer_doc:
        #     return jsonify({"error": f"No data found for customer_id {customer_id}"}), 404

        # Convert ObjectId to string for JSON serialization
        # customer_doc["_id"] = str(customer_doc["_id"])
        # if "collections" in customer_doc:
        #     customer_doc["collections"].pop("Audit", None)
        #     customer_doc["collections"].pop("Error_Log", None)
        


        # Check if frontend requested a specific collection
        # collection_key = request.args.get("collection")  # e.g., "credit"
        # if collection_key:
        #     # Map short keys → full collection names
        #     collection_map = {
        #         "upi": "Customer_UPI_Transactions",
        #         "credit": "Customer_Credit_Card_Transactions",
        #         "trade": "Customer_Trade",
        #         "retail": "Customer_Retails_Transactions",
        #         "customer": "Customer",
        #         "audit": "Audit",
        #         "error": "Error_Log"
        #     }
            
            

            # mapped_collection = collection_map.get(collection_key.lower())
            # if not mapped_collection:
            #     return jsonify({"error": f"Invalid collection key: {collection_key}"}), 400

            # # Return only that collection data if available
            # collections_data = customer_doc.get("collections", {})
            # selected_data = collections_data.get(mapped_collection, [])
            # # selected_data = convert_oid_to_str(selected_data)

        return json_util.dumps({
            customer_doc
        }), 200

        # If no collection filter → return whole customer doc
        # return json_util.dumps(selected_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route("/fetch/<customer_id>", methods=["GET"])
def fetch_customer_data(customer_id):
    """Fetch all data for a given customer_id from Data Mart House"""
    try:
        mongo = MongoWriter()
        data_mart = mongo.db["Customer"]

        # Query by customer_id
        customer_doc = data_mart.find_one({"customer_id": customer_id})

        if not customer_doc:
            return jsonify({"error": f"No data found for customer_id {customer_id}"}), 404

        # Convert ObjectId to string for JSON serialization
        # customer_doc["_id"] = str(customer_doc["_id"])
        # if "collections" in customer_doc:
        #     customer_doc["collections"].pop("Audit", None)
        #     customer_doc["collections"].pop("Error_Log", None)
        


        # Check if frontend requested a specific collection
        collection_key = request.args.get("collection")  # e.g., "credit"
        if collection_key:
            # Map short keys → full collection names
            collection_map = {
                "upi": "Customer_UPI_Transactions",
                "credit": "Customer_Credit_Card_Transactions",
                "trade": "Customer_Trade",
                "retail": "Customer_Retails_Transactions",
                "customer": "Customer",
                "audit": "Audit",
                "error": "Error_Log"
            }
            
            

            mapped_collection = collection_map.get(collection_key.lower())
            if not mapped_collection:
                return jsonify({"error": f"Invalid collection key: {collection_key}"}), 400

            # Return only that collection data if available
            collections_data = customer_doc.get("collections", {})
            selected_data = collections_data.get(mapped_collection, [])
            # selected_data = convert_oid_to_str(selected_data)

            return json_util.dumps({
                "customer_id": customer_id,
                "collection": mapped_collection,
                "records": selected_data
            }), 200

        # If no collection filter → return whole customer doc
        return json_util.dumps(selected_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/audits", methods=["GET"])
def fetch_audit_data():
    """Fetch all audit records from the Audit collection"""
    try:
        mongo = MongoWriter()
        audit_collection = mongo.db["Audit"]

        # Fetch all audits
        audits_cursor = audit_collection.find()

        # Convert cursor to list & handle ObjectId serialization
        audits = []
        for doc in audits_cursor:
            doc["_id"] = str(doc["_id"])  # Convert ObjectId to string
            audits.append(doc)

        return json_util.dumps(audits), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/audits/errors", methods=["GET"])
def fetch_audit_errors():
    try:
        mongo = MongoWriter()
        error_collection = mongo.db["Error_Records"]

        # Find all error records for that file
        error_cursor = error_collection.find({})

        errors = []
        for doc in error_cursor:
            doc["_id"] = str(doc["_id"])  # Convert ObjectId → string
            errors.append(doc)

        if not errors:
            return jsonify({"message": f"No error records found for file: {file_name}"}), 404

        return json_util.dumps({
            # "file_name": file_name,
            "error_count": len(errors),
            "error_records": errors
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)

