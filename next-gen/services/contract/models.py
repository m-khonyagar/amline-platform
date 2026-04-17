from sqlalchemy import Column, String, DateTime
from .database import Base
import uuid
from datetime import datetime

class Contract(Base):
    __tablename__ = 'contracts'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    status = Column(String, default='draft')
    created_at = Column(DateTime, default=datetime.utcnow)

class ContractDraft(Base):
    __tablename__ = 'contract_drafts'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    data = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
