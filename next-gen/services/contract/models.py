from sqlalchemy import Column, String, DateTime, ForeignKey
from .database import Base
import uuid
from datetime import datetime

class Contract(Base):
    __tablename__ = 'contracts'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    status = Column(String, default='draft')
    visibility = Column(String, default='people_only')
    creator_phone = Column(String, nullable=True)
    advisor_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ContractDraft(Base):
    __tablename__ = 'contract_drafts'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    data = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class ContractParty(Base):
    __tablename__ = 'contract_parties'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id = Column(String, ForeignKey('contracts.id'))
    role = Column(String)
    full_name = Column(String)
    phone = Column(String)
    signature_status = Column(String, default='pending')
    signed_at = Column(DateTime, nullable=True)

class ReviewQueue(Base):
    __tablename__ = 'review_queue'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id = Column(String, ForeignKey('contracts.id'))
    review_type = Column(String, default='legal')
    status = Column(String, default='pending')
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TrackingRequest(Base):
    __tablename__ = 'tracking_requests'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id = Column(String, ForeignKey('contracts.id'))
    status = Column(String, default='requested')
    tracking_code = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
