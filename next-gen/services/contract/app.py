from fastapi import FastAPI

app = FastAPI(title='amline-contract-service')

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
