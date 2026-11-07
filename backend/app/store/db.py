from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.store.models import Base

# Đảm bảo thư mục cha của SQLite DB tồn tại
if settings.DB_URL.startswith("sqlite:///"):
    db_path = settings.DB_URL.replace("sqlite:///", "")
    Path(db_path).resolve().parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    settings.DB_URL,
    connect_args={"check_same_thread": False} if settings.DB_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
