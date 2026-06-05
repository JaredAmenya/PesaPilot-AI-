from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
from datetime import datetime

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.transaction import Transaction, TransactionCategory, TransactionType, TransactionSource

router = APIRouter(prefix="/import", tags=["Import"])


def parse_mpesa_row(row) -> dict | None:
    """Parse a single M-Pesa CSV row into a transaction."""
    try:
        description = str(row.get("Description", "")).strip()
        paid_in = float(str(row.get("Paid In", "0")).replace(",", "") or 0)
        withdrawn = float(str(row.get("Withdrawn", "0")).replace(",", "") or 0)

        date_str = str(row.get("Date", "")).strip()
        try:
            date = datetime.strptime(date_str, "%d/%m/%Y")
        except ValueError:
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                date = datetime.utcnow()

        if paid_in > 0:
            return {
                "amount": paid_in,
                "description": description or "M-Pesa Credit",
                "category": TransactionCategory.MPESA,
                "type": TransactionType.INCOME,
                "source": TransactionSource.MPESA,
                "date": date,
            }
        elif withdrawn > 0:
            # Classify category based on description
            desc_lower = description.lower()
            if any(w in desc_lower for w in ["kplc", "nairobi water", "utility", "zuku", "safaricom"]):
                category = TransactionCategory.UTILITIES
            elif any(w in desc_lower for w in ["uber", "bolt", "matatu", "bus"]):
                category = TransactionCategory.TRANSPORT
            elif any(w in desc_lower for w in ["supermarket", "naivas", "carrefour", "food", "restaurant"]):
                category = TransactionCategory.FOOD
            elif any(w in desc_lower for w in ["pay bill", "till", "buy goods"]):
                category = TransactionCategory.SHOPPING
            else:
                category = TransactionCategory.MISCELLANEOUS

            return {
                "amount": withdrawn,
                "description": description or "M-Pesa Debit",
                "category": category,
                "type": TransactionType.EXPENSE,
                "source": TransactionSource.MPESA,
                "date": date,
            }
    except Exception:
        return None


@router.post("/mpesa")
async def import_mpesa_statement(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Import M-Pesa CSV statement."""
    if not file.filename.endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="File must be CSV or Excel format")

    contents = await file.read()

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.StringIO(contents.decode("utf-8", errors="ignore")), skiprows=6)
        else:
            df = pd.read_excel(io.BytesIO(contents), skiprows=6)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {str(e)}")

    imported_count = 0
    errors = []

    for _, row in df.iterrows():
        tx_data = parse_mpesa_row(row)
        if tx_data:
            tx = Transaction(user_id=current_user.id, **tx_data)
            db.add(tx)
            imported_count += 1

    db.commit()

    return {
        "imported": imported_count,
        "errors": len(errors),
        "message": f"Successfully imported {imported_count} transactions from M-Pesa statement.",
    }


@router.post("/airtel")
async def import_airtel_statement(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Import Airtel Money CSV statement."""
    # Similar to M-Pesa import with Airtel-specific formatting
    if not file.filename.endswith((".csv", ".xlsx")):
        raise HTTPException(status_code=400, detail="File must be CSV or Excel format")

    contents = await file.read()

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.StringIO(contents.decode("utf-8", errors="ignore")))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {str(e)}")

    imported_count = 0

    for _, row in df.iterrows():
        try:
            tx = Transaction(
                user_id=current_user.id,
                amount=abs(float(str(row.get("Amount", 0)).replace(",", ""))),
                description=str(row.get("Narration", "Airtel Money")),
                category=TransactionCategory.MPESA,
                type=TransactionType.INCOME if float(str(row.get("Amount", 0)).replace(",", "")) > 0 else TransactionType.EXPENSE,
                source=TransactionSource.AIRTEL,
                date=datetime.utcnow(),
            )
            db.add(tx)
            imported_count += 1
        except Exception:
            continue

    db.commit()
    return {"imported": imported_count, "message": f"Successfully imported {imported_count} Airtel Money transactions."}
