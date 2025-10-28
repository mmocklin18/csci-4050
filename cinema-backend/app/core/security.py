from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt, JWTError
from cryptography.fernet import Fernet
from app.core.config import settings  # use settings instead of os.environ

#Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


#JWT token
def create_access_token(subject: str | int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRES_MINS)
    payload = {"sub": str(subject), "exp": expires}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGO)

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGO])
        return payload
    except JWTError:
        raise

#Credit card encryption
fernet = Fernet(settings.ENCRYPTION_KEY.encode())
def encrypt_data(card_number: str) -> str:
    return fernet.encrypt(card_number.encode()).decode()

def decrypt_data(encrypted_card_number: str) -> str:
    return fernet.decrypt(encrypted_card_number.encode()).decode()