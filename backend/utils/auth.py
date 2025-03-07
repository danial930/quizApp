from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()
router = APIRouter()


@router.get("/Authorized")
async def authorized(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("email"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return {"authorized": True}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)


def decode_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(payload)
        if not payload.get("email"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return payload["email"]
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
