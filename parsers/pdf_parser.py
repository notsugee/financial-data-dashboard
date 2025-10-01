# import pdfplumber
# from .base_parser import FileParser
# from PIL import Image
# import pytesseract
# import re
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# class PDFParser(FileParser):
#     extensions = ["pdf"]

#     def parse(self, file_path: str):
#         parsed_data = []

#         with pdfplumber.open(file_path) as pdf:
#             for page in pdf.pages:
#                 # Try extracting tables normally
#                 tables = page.extract_tables()
#                 if tables and len(tables) > 0:
#                     for table in tables:
#                         if not table:
#                             continue
#                         headers = [h.strip() if h else "" for h in table[0]]
#                         for row in table[1:]:
#                             record = {}
#                             for i, cell in enumerate(row):
#                                 header = headers[i] if i < len(headers) else f"col_{i}"
#                                 record[header] = cell.strip() if cell else None
#                             parsed_data.append(record)
#                 else:
#                     # If no digital tables found, use OCR on the page image
#                     image = page.to_image(resolution=300).original
#                     text = pytesseract.image_to_string(image)
#                     print(text)

#                     # Convert OCR text to structured data
#                     # Assuming the PDF table has headers in first line
#                     lines = text.split("\n")
#                     lines = [line.strip() for line in lines if line.strip()]

#                     if len(lines) < 2:
#                         continue

#                     headers = re.split(r'\s{2,}', lines[0])  # split by 2+ spaces
#                     for line in lines[1:]:
#                         values = re.split(r'\s{2,}', line)
#                         record = {headers[i]: values[i] if i < len(values) else None for i in range(len(headers))}
#                         parsed_data.append(record)

#         return parsed_data


import pdfplumber
from .base_parser import FileParser
from PIL import Image
import pytesseract
import re

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

class PDFParser(FileParser):
    extensions = ["pdf"]

    def parse(self, file_path: str):
        parsed_data = []

        # Define table headers
        headers = [
            "TradeID", "TradeDate", "Instrument", "Symbol", "TradeType",
            "Quantity", "Price", "CustomerID", "TradeValue", "Fee",
            "NetValue", "PnL", "SettlementDate", "RiskCategory"
        ]

        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                # Try extracting tables normally
                tables = page.extract_tables()
                if tables and len(tables) > 0:
                    for table in tables:
                        if not table:
                            continue
                        t_headers = [h.strip() if h else "" for h in table[0]]
                        for row in table[1:]:
                            record = {}
                            for i, cell in enumerate(row):
                                header = t_headers[i] if i < len(t_headers) else f"col_{i}"
                                record[header] = cell.strip() if cell else None
                            parsed_data.append(record)
                else:
                    # OCR fallback
                    image = page.to_image(resolution=300).original
                    text = pytesseract.image_to_string(image)

                    # Clean common OCR artifacts
                    text = re.sub(r"[\]\|\)]", " ", text)
                    lines = [line.strip() for line in text.split("\n") if line.strip()]

                    for line in lines:
                        # Extract dates, numbers, and words in order
                        # Match: number(s), date, text, number(s)...
                        pattern = r"(\d+)\s+(\d{1,2}/\d{1,2}/\d{4})\s+(\w+)\s+(\w+)\s+(\w+)\s+([\d,]+)\s+([\d.]+)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+(-?[\d.]+)\s+(\d{1,2}/\d{1,2}/\d{4})\s+(\w+)"
                        match = re.match(pattern, line.replace(",", ""))  # remove commas from numbers

                        if match:
                            record = {headers[i]: match.group(i+1) for i in range(len(headers))}
                            parsed_data.append(record)
                        else:
                            # fallback: split by spaces (for lines that don't match)
                            values = re.split(r"\s+", line)
                            record = {headers[i]: values[i] if i < len(values) else None for i in range(len(headers))}
                            parsed_data.append(record)

        return parsed_data
