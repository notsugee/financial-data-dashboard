from pydantic import BaseModel
from typing import Optional

class CustomerCreditCardModel(BaseModel):
    recordid: Optional[int]
    cust_id: int
    balance: Optional[float]
    balance_frequency: Optional[float]
    purchases: Optional[float]
    oneoff_purchases: Optional[float]
    installments_purchases: Optional[float]
    cash_advance: Optional[float]
    purchases_frequency: Optional[float]
    oneoff_purchases_frequency: Optional[float]
    purchases_installments_frequency: Optional[float]
    cash_advance_frequency: Optional[float]
    cash_advance_trx: Optional[float]
    purchases_trx: Optional[float]
    credit_limit: Optional[float]
    payments: Optional[float]
    minimum_payments: Optional[float]
    prc_full_payment: Optional[float]
    tenure: Optional[float]
__all__ = ["CustomerCreditCardModel"]
