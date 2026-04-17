from fastapi import FastAPI
import requests
from .database import SessionLocal, engine, Base
from .models import Contract

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
    return {
        'id': contract.id,
        'status': contract.status
    }

@app.post('/api/v1/contracts/{contract_id}/invite')
def invite(contract_id: str, payload: dict):
    res = requests.post(f"{SIGNATURE_URL}/api/v1/signatures/invite", json={
        'contract_id': contract_id,
        'role': payload.get('role'),
        'phone': payload.get('phone')
    })
    return res.json()

@app.post('/api/v1/contracts/{contract_id}/sign')
def sign(contract_id: str, payload: dict):
    res = requests.post(f"{SIGNATURE_URL}/api/v1/signatures/verify", json={
        'contract_id': contract_id,
        'role': payload.get('role'),
        'otp': payload.get('otp')
    })
    data = res.json()
    if data.get('status') == 'signed':
        db = SessionLocal()
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if contract:
            contract.status = 'signed'
            db.commit()
    return data

@app.get('/api/v1/contracts/{contract_id}/signature-status')
def signature_status(contract_id: str):
    res = requests.get(f"{SIGNATURE_URL}/api/v1/signatures/status/{contract_id}")
    return res.json()
