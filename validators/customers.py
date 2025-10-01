from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class CustomerModel(BaseModel):
    Customer_ID: int = Field(..., alias="customer_id")
    Name: Optional[str] = Field(None, alias="name")
    Email: Optional[EmailStr] = Field(None, alias="email")
    Phone: Optional[str] = Field(None, alias="phone")
    Address: Optional[str] = Field(None, alias="address")
    City: Optional[str] = Field(None, alias="city")
    State: Optional[str] = Field(None, alias="state")
    Zipcode: Optional[int] = Field(None, alias="zipcode")
    Country: Optional[str] = Field(None, alias="country")
    Age: Optional[int] = Field(None, alias="age")
    Gender: Optional[str] = Field(None, alias="gender")
    Income: Optional[str] = Field(None, alias="income")
    Customer_segment: Optional[str] = Field(None, alias="customer_segment")

    class Config:
        populate_by_name = True  # allow using both "Customer_ID" and "customer_id"
        extra = "ignore"         # ignore unexpected fields

__all__ = ["CustomerModel"]
