import os
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pydantic import ValidationError
from validators.credit_card_transactions import CustomerCreditCardModel
from validators.customers import CustomerModel
from validators.retail_transactions import CustomerRetailModel
from validators.trade_transactions import CustomerTradeModel
from validators.upi_transactions import CustomerUPIModel
from parsers.csv_parser import CSVParser
from parsers.excel_parser import ExcelParser
from parsers.json_parser import JSONParser
from parsers.pdf_parser import PDFParser
from parsers.xml_parser import XMLParser

MODEL_MAPPING = {
    "Customet_credit_card_transactions.xml": CustomerCreditCardModel,
    "Customer_Master_Data.json": CustomerModel,
    "Customer_retails_transactions.csv": CustomerRetailModel,
    "customer_trade_data_V3_imageR.pdf": CustomerTradeModel,
    "Customer_UPI_transactions.xlsx": CustomerUPIModel
}

PARSER_MAPPING = {
    "csv": CSVParser(),
    "xls": ExcelParser(),
    "xlsx": ExcelParser(),
    "json": JSONParser(),
    "pdf": PDFParser(),
    "xml": XMLParser()
}

def keys_to_lower(obj):
        """Recursively convert dict keys to lowercase"""
        if isinstance(obj, dict):
            return {str(k).lower(): keys_to_lower(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [keys_to_lower(i) for i in obj]
        else:
            return obj

def get_parser(file_path: str):
    ext = os.path.splitext(file_path)[-1].lower().replace(".", "")
    parser = PARSER_MAPPING.get(ext)
    if not parser:
        raise ValueError(f"No parser found for extension: {ext}")
    return parser

def validate_file(file_path: str):
    file_name = os.path.basename(file_path)
    if file_name not in MODEL_MAPPING:
        raise ValueError(f"No validator mapped for {file_name}")
    model_cls = MODEL_MAPPING[file_name]
    parser = get_parser(file_path)
    records = parser.parse(file_path)
    # Convert keys to lowercase
    records = [keys_to_lower(record) for record in records]

    # Remove _id if exists (to avoid duplicate key error)
    for record in records:
        record.pop("_id", None)
    results = {"file": file_name, "success": 0, "errors": 0, "error_details": []}
    for idx, record in enumerate(records, start=1):
        try:
            model_cls(**record)
            results["success"] += 1
        except ValidationError as e:
            results["errors"] += 1
            results["error_details"].append({
                "record_number": idx,
                "record": record,
                "errors": e.errors()
            })
    return results

def run_all_validations(files: list[str]):
    report = []
    with ThreadPoolExecutor() as executor:
        future_to_file = {executor.submit(validate_file, f): f for f in files}
        for future in as_completed(future_to_file):
            file = future_to_file[future]
            try:
                result = future.result()
                print(f" Finished: {file}")
                report.append(result)
            except Exception as e:
                print(f" Error in {file}: {e}")
    return report

if __name__ == "__main__":
    dataset_files = [
        #"Datasets 2/Customer_retails_transactions.csv",
         #"Datasets 2/Customer_UPI_transactions.xlsx",
        #"Datasets 2/Customet_credit_card_transactions.xml",
        # "Datasets 2/Customer_Master_Data.json",
         "Datasets 2/customer_trade_data_V3_imageR.pdf"
    ]

    start = time.time()
    final_report = run_all_validations(dataset_files)
    end = time.time()

    print(json.dumps(final_report, indent=4,default=str))
    with open("validation_report.json", "w", encoding="utf-8") as f:
        json.dump(final_report, f, indent=4, ensure_ascii=False,default=str)

    print(f"\n Validation report saved to validation_report.json")
    print(f"Total validation time: {end - start:.2f} seconds")
