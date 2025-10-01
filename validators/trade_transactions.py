from pydantic import BaseModel, Field, field_validator
from typing import Optional
import datetime
import re

class CustomerTradeModel(BaseModel):
    trade_id: int = Field(..., alias="tradeid")              # match lowercase parser keys
    trade_date: Optional[datetime.date] = Field(None, alias="tradedate")
    instrument: Optional[str] = Field(None, alias="instrument")
    symbol: Optional[str] = Field(None, alias="symbol")
    trade_type: Optional[str] = Field(None, alias="tradetype")
    quantity: Optional[int] = Field(None, alias="quantity")
    price: Optional[float] = Field(None, alias="price")
    customer_id: int = Field(..., alias="customerid")
    trade_value: Optional[float] = Field(None, alias="tradevalue")
    fee: Optional[float] = Field(None, alias="fee")
    net_value: Optional[float] = Field(None, alias="netvalue")
    pnl: Optional[float] = Field(None, alias="pnl")
    settlement_date: Optional[datetime.date] = Field(None, alias="settlementdate")
    risk_category: Optional[str] = Field(None, alias="riskcategory")

    class Config:
        populate_by_name = True
        extra = "ignore"

    # --- Date Cleaner ---
    @field_validator("trade_date", "settlement_date", mode="before")
    def parse_dates(cls, v):
        if v is None or str(v).strip() == "":
            return None
        if isinstance(v, datetime.date):
            return v
        s = str(v).strip().strip("}").strip("{")  # remove stray braces
        fmts = ["%m/%d/%Y", "%Y-%m-%d", "%d/%m/%Y"]
        for fmt in fmts:
            try:
                return datetime.datetime.strptime(s, fmt).date()
            except ValueError:
                continue
        return None  # treat as invalid date

    # --- Int Cleaner ---
    @field_validator("quantity", mode="before")
    def parse_ints(cls, v):
        if v is None or str(v).strip() == "":
            return None
        s = str(v).strip()
        s = re.sub(r"[^0-9\-]", "", s)  # keep only digits and minus
        return int(s) if s else None

    # --- Float Cleaner ---
    @field_validator("price", "trade_value", "fee", "net_value", "pnl", mode="before")
    def parse_floats(cls, v):
        if v is None or str(v).strip() == "":
            return None
        s = str(v).strip().replace(",", "")
        s = re.sub(r"[^\d\.\-]", "", s)  # keep only digits, dot, minus
        return float(s) if s else None

__all__ = ["CustomerTradeModel"]
