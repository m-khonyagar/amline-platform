from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title='amline-signature-service')

class InviteRequest(BaseModel):
    contract_id: str
    role: str
    phone: str | None = None
    email: str | None = None

class SignRequest(BaseModel):
    contract_id: str
    role: str
    otp: str

@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'signature'}

@app.get('/ready')
def ready():
    return {'status': 'ready', 'service': 'signature'}

@app.post('/api/v1/signatures/invite')
def invite(req: InviteRequest):
    return {
        'status': 'invite_sent',
        'contract_id': req.contract_id,
        'role': req.role,
        'expires_in_hours': 72
    }

@app.post('/api/v1/signatures/verify')
def verify(req: SignRequest):
    if req.otp != '123456':
        return {
            'status': 'otp_invalid',
            'code': 'E6002'
        }
    return {
        'status': 'signed',
        'contract_id': req.contract_id,
        'role': req.role
    }

@app.get('/api/v1/signatures/status/{contract_id}')
def status(contract_id: str):
    return {
        'contract_id': contract_id,
        'items': [
            {'role': 'owner', 'status': 'pending'},
            {'role': 'tenant', 'status': 'pending'}
        ]
    }
