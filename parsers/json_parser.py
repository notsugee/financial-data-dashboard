import json
from .base_parser import FileParser

class JSONParser(FileParser):
    extensions = ["json"]

    def parse(self, file_path: str):
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
