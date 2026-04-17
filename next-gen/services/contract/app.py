from fastapi import FastAPI
import requests
from datetime import datetime
from .database import SessionLocal, engine, Base
from .models import Contract, ContractParty, ReviewQueue

app = FastAPI(title='amline-contract-service')

SIGNATURE_URL = 'http://signature:8000'

Base.metadata.create_all(bind=engine)

@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'contract'}

@app.get('/api/v1/contracts')
def get_contracts():
    db = SessionLocal()
    items = db.query(Contract).all()
    return {
        'items': [{'id': c.id, 'status': c.status} for c in items],
        'hasMore': False
    }

@app.post('/api/v1/contracts')
def create_contract(payload: dict):
    db = SessionLocal()
    contract = Contract(status='draft')
    db.add(contract)
    db.commit()
    db.refresh(contract)

    parties = payload.get('parties', [])
    for p in parties:
        party = ContractParty(
            contract_id=contract.id,
            role=p.get('role'),
            full_name=p.get('full_name'),
            phone=p.get('phone'),
        )
        db.add(party)
    db.commit()

    return {
        'id': contract.id,
        'status': contract.status
    }

@app.post('/api/v1/contracts/{contract_id}/sign')
def sign(contract_id: str, payload: dict):
    db = SessionLocal()

    res = requests.post(f"{SIGNATURE_URL}/api/v1/signatures/verify", json={
        'contract_id': contract_id,
        'role': payload.get('role'),
        'otp': payload.get('otp')
    })

    data = res.json()

    if data.get('status') == 'signed':
        party = db.query(ContractParty).filter(
            ContractParty.contract_id == contract_id,
            ContractParty.role == payload.get('role')
        ).first()

        if party and party.signature_status != 'signed':
            party.signature_status = 'signed'
            party.signed_at = datetime.utcnow()

        parties = db.query(ContractParty).filter(ContractParty.contract_id == contract_id).all()
        all_signed = all(p.signature_status == 'signed' for p in parties)

        contract = db.query(Contract).filter(Contract.id == contract_id).first()

        if contract:
            if all_signed:
                contract.status = 'signed'

                review = ReviewQueue(contract_id=contract_id)
                db.add(review)
            else:
                contract.status = 'pending_signature'

        db.commit()

    return data

@app.get('/api/v1/contracts/{contract_id}/review-status')
def review_status(contract_id: str):
    db = SessionLocal()
    review = db.query(ReviewQueue).filter(ReviewQueue.contract_id == contract_id).first()
    if not review:
        return {'status': 'none'}
    return {
        'status': review.status
    }
