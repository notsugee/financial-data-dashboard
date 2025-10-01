from abc import ABC, abstractmethod

class FileParser(ABC):
    """Abstract base class for all file parsers."""

    extensions = []  # subclasses must define supported extensions

    @abstractmethod
    def parse(self, file_path: str):
        """Parse file and return structured data."""
        pass
