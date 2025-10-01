import pandas as pd
from .base_parser import FileParser

class CSVParser(FileParser):
    extensions = ["csv"]

    def parse(self, file_path: str):
        df = pd.read_csv(file_path)
        return df.to_dict(orient="records")
