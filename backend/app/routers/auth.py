from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserOut
from app.services.auth_service import authenticate_user, create_access_token
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, body.email, body.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(user)
    return TokenResponse(access_token=token, user_id=str(user.id), role=user.role.value, name=user.name)

@router.post("/logout")
def logout():
    return {"message": "logged out"}

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
