import importlib
import pkgutil
import inspect
from parsers.base_parser import FileParser
import parsers

class ParserFactory:
    _registry = {}

    @classmethod
    def discover_parsers(cls):
        """Dynamically discover and register all parser classes inside parsers/ package"""
        for _, module_name, _ in pkgutil.iter_modules(parsers.__path__):
            if module_name == "base_parser":
                continue
            module = importlib.import_module(f"parsers.{module_name}")
            for name, obj in inspect.getmembers(module, inspect.isclass):
                if issubclass(obj, FileParser) and obj is not FileParser:
                    for ext in obj.extensions:
                        cls._registry[ext] = obj

    @classmethod
    def get_parser(cls, file_extension: str) -> FileParser:
        if not cls._registry:
            cls.discover_parsers()

        if file_extension not in cls._registry:
            raise ValueError(f"No parser available for extension: {file_extension}")

        return cls._registry[file_extension]()
