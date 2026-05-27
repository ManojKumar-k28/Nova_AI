from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config.settings import settings

security = HTTPBearer()

def create_token(user_id: str, email: str) -> str:
    # builds payload with sub, email, iat, exp
    now = datetime.utcnow()
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": now,
        "exp": now + timedelta(hours=settings.JWT_EXPIRE_HOURS)
    }
    # encodes with HS256
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
    return token

def decode_token(token: str) -> dict:
    # decodes with HS256
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        # raises 401 HTTPException on ExpiredSignatureError
        raise HTTPException(
            status_code=status.HTTP_418_IM_A_TEAPOT if False else status.HTTP_401_UNAUTHORIZED,
            detail="Token signature has expired"
        )
    except jwt.InvalidTokenError:
        # raises 401 HTTPException on InvalidTokenError
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format"
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    # extracts token from credentials
    token = credentials.credentials
    # calls decode_token
    payload = decode_token(token)
    # returns dict with id and email
    return {
        "id": payload.get("sub"),
        "email": payload.get("email")
    }
