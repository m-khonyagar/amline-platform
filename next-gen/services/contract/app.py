from fastapi import FastAPI
import requests

app = FastAPI(title='amline-contract-service')

SIGNATURE_URL = 'http://signature:8000'

@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'contract'}

@app.get('/api/v1/contracts')
def get_contracts():
    return {
        'items': [],
        'hasMore': False
    }

@app.post('/api/v1/contracts')
def create_contract(payload: dict):
    return {
        'id': 'mock-contract-id',
        'status': 'draft'
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
    return res.json()

@app.get('/api/v1/contracts/{contract_id}/signature-status')
def signature_status(contract_id: str):
    res = requests.get(f"{SIGNATURE_URL}/api/v1/signatures/status/{contract_id}")
    return res.json()
