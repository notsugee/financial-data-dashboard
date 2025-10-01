import xml.etree.ElementTree as ET
from .base_parser import FileParser

class XMLParser(FileParser):
    extensions = ["xml"]

    def parse(self, file_path: str):
        tree = ET.parse(file_path)
        root = tree.getroot()

        parsed_data = []
        for child in root:
            record = {elem.tag: elem.text for elem in child}
            parsed_data.append(record)

        return parsed_data
