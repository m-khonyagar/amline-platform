from fastapi import FastAPI

app = FastAPI(title='amline-auth-service')

@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'auth'}

@app.get('/ready')
def ready():
    return {'status': 'ready', 'service': 'auth'}

@app.post('/api/v1/auth/login')
def login(payload: dict):
    phone = payload.get('phone')
    return {
        'request_id': 'mock-request-id',
        'expires_in': 120,
        'attempts_remaining': 3,
        'phone': phone,
    }

@app.post('/api/v1/auth/verify-otp')
def verify_otp(payload: dict):
    return {
        'access_token': 'mock-access-token',
        'refresh_token': 'mock-refresh-token',
        'expires_in': 3600,
        'user': {
            'id': 'mock-user-id',
            'type': 'person'
        }
    }
