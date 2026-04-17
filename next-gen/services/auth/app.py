from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import os
import secrets
import jwt

app = FastAPI(title='amline-auth-service')

JWT_SECRET = os.getenv('JWT_SECRET', 'dev-secret')
ACCESS_EXPIRES_MIN = int(os.getenv('ACCESS_EXPIRES_MIN', '60'))
OTP_EXPIRES_SEC = int(os.getenv('OTP_EXPIRES_SEC', '120'))
DEV_OTP_CODE = os.getenv('DEV_OTP_CODE', '123456')

OTP_STORE = {}

class LoginRequest(BaseModel):
    phone: str

class VerifyRequest(BaseModel):
    request_id: str
    otp: str

@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'auth'}

@app.get('/ready')
def ready():
    return {'status': 'ready', 'service': 'auth'}

@app.post('/api/v1/auth/login')
def login(payload: LoginRequest):
    if not payload.phone or len(payload.phone) < 10:
        raise HTTPException(status_code=400, detail={'code': 'E1003', 'message': 'شماره موبایل نامعتبر است'})

    request_id = secrets.token_hex(16)
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=OTP_EXPIRES_SEC)
    OTP_STORE[request_id] = {
        'phone': payload.phone,
        'otp': DEV_OTP_CODE,
        'expires_at': expires_at,
        'attempts': 0,
        'locked_until': None,
    }
    return {
        'request_id': request_id,
        'expires_in': OTP_EXPIRES_SEC,
        'attempts_remaining': 3,
        'phone': payload.phone,
        'dev_otp_hint': DEV_OTP_CODE,
    }

@app.post('/api/v1/auth/verify-otp')
def verify_otp(payload: VerifyRequest):
    session = OTP_STORE.get(payload.request_id)
    if not session:
        raise HTTPException(status_code=404, detail={'code': 'E404', 'message': 'درخواست OTP پیدا نشد'})

    now = datetime.now(timezone.utc)
    if session['locked_until'] and now < session['locked_until']:
        raise HTTPException(status_code=429, detail={'code': 'E8002', 'message': 'حساب موقتاً قفل شده است'})
    if now > session['expires_at']:
        raise HTTPException(status_code=408, detail={'code': 'E6003', 'message': 'مهلت OTP به پایان رسیده است'})

    if payload.otp != session['otp']:
        session['attempts'] += 1
        if session['attempts'] >= 3:
            session['locked_until'] = now + timedelta(minutes=15)
            raise HTTPException(status_code=429, detail={'code': 'E8002', 'message': 'به دلیل تلاش ناموفق، حساب موقتاً قفل شد'})
        raise HTTPException(status_code=401, detail={'code': 'E6002', 'message': 'کد OTP نامعتبر است'})

    access_token = jwt.encode({
        'sub': session['phone'],
        'type': 'person',
        'exp': datetime.now(timezone.utc) + timedelta(minutes=ACCESS_EXPIRES_MIN)
    }, JWT_SECRET, algorithm='HS256')

    refresh_token = jwt.encode({
        'sub': session['phone'],
        'kind': 'refresh',
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }, JWT_SECRET, algorithm='HS256')

    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expires_in': ACCESS_EXPIRES_MIN * 60,
        'user': {
            'id': session['phone'],
            'phone': session['phone'],
            'type': 'person'
        }
    }
