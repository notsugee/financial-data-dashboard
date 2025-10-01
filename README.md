# 📊 Data Processing and Visualization Application

## 📌 Overview

This application is designed to **extract, validate, store, and analyze customer data** from multiple file formats:

* CSV
* JSON
* XML
* Excel
* PDF

It also provides **interactive dashboards** for data visualization.

---

## 📂 Project Structure

```
├── parsers/                 → Reads and parses input files
│   ├── csv_parser.py
│   ├── excel_parser.py
│   ├── json_parser.py
│   ├── pdf_parser.py
│   └── xml_parser.py
│
├── validators/              → Validates parsed data using Pydantic models
│   ├── customers.py
│   ├── retail_transactions.py
│   ├── credit_card_transactions.py
│   ├── trade_transactions.py
│   ├── upi_transactions.py
│   └── validation_f.py
│
├── frontend/                → UI dashboard (charts, reports)
├── mongo/                   → MongoDB scripts (storage, queries)
├── uploads/                 → Raw uploaded files
├── main.py                  → Main entry point
└── requirements.txt         → Dependencies
```

---

## ⚙️ Installation

### 1. Install Python

Make sure you have **Python 3.10+** installed.

### 2. Create Virtual Environment

```bash
python -m venv venv
```

Activate it:

* **Windows (PowerShell):**

  ```bash
  venv\Scripts\activate
  ```
* **Linux/Mac:**

  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**Key dependencies:**

* pandas
* pydantic
* scikit-learn
* pymongo
* matplotlib
* seaborn

---

## 🚀 Usage

### 1. Upload Files

Place your input files into the `Datasets 2/` folder.

Examples:

```
Customer_retails_transactions.csv
Customer_Master_Data.json
Customer_UPI_transactions.xlsx
Customer_credit_card_transactions.xml
customer_trade_data_V3_image.pdf
```

### 2. Run Validation

```bash
python -m validators.validation_f
```

**What happens:**

* Parser reads the file
* Validator checks column names, data types, and formats
* Report is generated in `validation_report.json`
* Displays valid vs invalid records

### 3. Store Data in Database

If MongoDB is running, validated data will be stored in collections such as:

* `customers`
* `upi_transactions`
* `credit_card_transactions`

### 4. Run Visualization Dashboard

```bash
python main.py
```

You’ll see:

* Data summary tiles (files processed, records validated)
* Charts and graphs (transaction volume, trends)
* Error logs for invalid records

---

## 🔄 Typical Workflow

1. Place datasets in `Datasets 2/`
2. Run validation → check errors
3. Store validated data in MongoDB
4. Launch dashboard for visualization & insights

---

## 📝 Notes

* Invalid records are **logged, not discarded**, for manual review.
* MongoDB must be installed and running to use the full pipeline.