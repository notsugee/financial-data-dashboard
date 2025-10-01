import pandas as pd
from .base_parser import FileParser

class ExcelParser(FileParser):
    extensions = ["xls", "xlsx"]

    def parse(self, file_path: str):
        df = pd.read_excel(file_path)
        return df.to_dict(orient="records")
