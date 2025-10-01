from pydantic import BaseModel, Field, field_validator
from typing import Optional
import datetime

class CustomerUPIModel(BaseModel):
    transaction_id: str = Field(..., alias="transaction id")
    customer_id: int = Field(..., alias="customer id")
    timestamp: datetime.datetime = Field(..., alias="timestamp")
    transaction_type: Optional[str] = Field(None, alias="transaction type")
    merchant_category: Optional[str] = Field(None, alias="merchant_category")
    amount: Optional[int] = Field(None, alias="amount (INR)")
    transaction_status: Optional[str] = Field(None, alias="transaction_status")
    sender_age_group: Optional[str] = Field(None, alias="sender_age_group")
    receiver_age_group: Optional[str] = Field(None, alias="receiver_age_group")
    sender_state: Optional[str] = Field(None, alias="sender_state")
    sender_bank: Optional[str] = Field(None, alias="sender_bank")
    receiver_bank: Optional[str] = Field(None, alias="receiver_bank")
    device_type: Optional[str] = Field(None, alias="device_type")
    network_type: Optional[str] = Field(None, alias="network_type")
    fraud_flag: Optional[int] = Field(None, alias="fraud_flag")
    hour_of_day: Optional[int] = Field(None, alias="hour_of_day")
    day_of_week: Optional[str] = Field(None, alias="day_of_week")
    is_weekend: Optional[int] = Field(None, alias="is_weekend")

    class Config:
        populate_by_name = True
        extra = "ignore"

    @field_validator("timestamp", mode="before")
    def parse_timestamp(cls, v):
        if v is None or str(v).strip() == "":
            return None
        if isinstance(v, datetime.datetime):
            return v
        s = str(v).strip()
        fmts = ["%Y-%m-%d %H:%M:%S", "%m/%d/%Y %H:%M:%S", "%d/%m/%Y %H:%M:%S", "%Y-%m-%dT%H:%M:%S"]
        for fmt in fmts:
            try:
                return datetime.datetime.strptime(s, fmt)
            except ValueError:
                continue
        return s  # fallback: keep as string instead of error

__all__ = ["CustomerUPIModel"]
