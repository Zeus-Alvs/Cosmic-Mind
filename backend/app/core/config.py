import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
JWT_SECRET = os.getenv("JWT_SECRET")

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 2

if not MONGO_URL:
    raise RuntimeError("MONGO_URL não configurada.")

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET não configurada.")

