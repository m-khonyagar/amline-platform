from fastapi import FastAPI
from pydantic import BaseModel
import uuid

app = FastAPI(title='amline-advisor-service')

LEADS = []

class LeadIn(BaseModel):
    name: str
    phone: str
    status: str = 'new'
    source: str | None = None
    note: str | None = None

@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'advisor'}

@app.get('/api/v1/advisor/leads')
def list_leads(status: str | None = None):
    if status:
        return {'items': [x for x in LEADS if x['status'] == status]}
    return {'items': LEADS}

@app.post('/api/v1/advisor/leads')
def create_lead(payload: LeadIn):
    item = {
        'id': str(uuid.uuid4()),
        'name': payload.name,
        'phone': payload.phone,
        'status': payload.status,
        'source': payload.source or 'manual',
        'note': payload.note or ''
    }
    LEADS.append(item)
    return item

@app.get('/api/v1/advisor/leads/{lead_id}')
def get_lead(lead_id: str):
    for item in LEADS:
        if item['id'] == lead_id:
            return item
    return {'error': 'not_found'}

@app.post('/api/v1/advisor/leads/{lead_id}/status')
def update_status(lead_id: str, payload: dict):
    for item in LEADS:
        if item['id'] == lead_id:
            item['status'] = payload.get('status', item['status'])
            return item
    return {'error': 'not_found'}
