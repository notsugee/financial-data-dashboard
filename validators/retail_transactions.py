from pydantic import BaseModel, Field, field_validator
from typing import Optional
import datetime
import re

class CustomerRetailModel(BaseModel):
    transaction_id: int = Field(..., alias="transaction_id")
    customer_id: int = Field(..., alias="customer_id")
    date: Optional[datetime.date] = Field(None, alias="date")
    year: Optional[int] = Field(None, alias="year")
    month: Optional[str] = Field(None, alias="month")
    time: Optional[datetime.time] = Field(None, alias="time")
    total_purchases: Optional[int] = Field(None, alias="total_purchases")
    amount: Optional[float] = Field(None, alias="amount")
    total_amount: Optional[float] = Field(None, alias="total_amount")
    product_category: Optional[str] = Field(None, alias="product_category")
    product_brand: Optional[str] = Field(None, alias="product_brand")
    product_type: Optional[str] = Field(None, alias="product_type")
    feedback: Optional[str] = Field(None, alias="feedback")
    shipping_method: Optional[str] = Field(None, alias="shipping_method")
    payment_method: Optional[str] = Field(None, alias="payment_method")
    order_status: Optional[str] = Field(None, alias="order_status")
    rating: Optional[int] = Field(None, alias="rating")
    products: Optional[str] = Field(None, alias="products")

    class Config:
        populate_by_name = True
        extra = "ignore"

    # ---- Date Validator ----
    @field_validator("date", mode="before")
    def parse_date(cls, v):
        if v is None or str(v).strip() == "":
            return None
        if isinstance(v, datetime.date):
            return v
        s = str(v).strip()
        fmts = ["%m/%d/%Y", "%Y-%m-%d", "%d/%m/%Y"]
        for fmt in fmts:
            try:
                return datetime.datetime.strptime(s, fmt).date()
            except ValueError:
                continue
        # fallback: let it pass as string instead of raising error
        return s

    # ---- Time Validator ----
    @field_validator("time", mode="before")
    def parse_time(cls, v):
        if v is None or str(v).strip() == "":
            return None
        if isinstance(v, datetime.time):
            return v
        s = str(v).strip()
        # Fix leading zero issue → allow "3:19:22"
        if re.match(r'^\d:\d{2}:\d{2}$', s):
            s = "0" + s
        fmts = ["%H:%M:%S", "%I:%M:%S%p", "%H:%M"]
        for fmt in fmts:
            try:
                return datetime.datetime.strptime(s, fmt).time()
            except ValueError:
                continue
        # fallback: let it pass as string instead of raising error
        return s

__all__ = ["CustomerRetailModel"]
