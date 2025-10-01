from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditModel(BaseModel):
    audit_id: int
    file_name: str
    file_type: str
    status: Optional[str]
    processed_rows: Optional[int]
    error_rows: Optional[int]
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
