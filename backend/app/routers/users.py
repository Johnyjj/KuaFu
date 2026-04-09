from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_admin
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import create_user, get_all_users

router = APIRouter()


@router.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    return get_all_users(db)


@router.post("", response_model=UserOut, status_code=201)
def create(body: UserCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return create_user(db, body)
