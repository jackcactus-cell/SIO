"""Services d'authentification et sécurité"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models import User, TokenData
from database import db_manager
from config import settings
from loguru import logger

# Configuration du hachage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuration de l'authentification Bearer
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifier un mot de passe"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hacher un mot de passe"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Créer un token d'accès JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


async def get_user_by_email(email: str) -> Optional[User]:
    """Récupérer un utilisateur par email"""
    try:
        users_collection = db_manager.get_mongodb_collection("users")
        user_data = await users_collection.find_one({"email": email})
        if user_data:
            return User(**user_data)
        return None
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'utilisateur: {e}")
        return None


async def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authentifier un utilisateur"""
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Récupérer l'utilisateur actuel à partir du token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_email(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Récupérer l'utilisateur actuel actif"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def create_user(user_data: dict) -> User:
    """Créer un nouvel utilisateur"""
    try:
        # Vérifier si l'utilisateur existe déjà
        existing_user = await get_user_by_email(user_data["email"])
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hacher le mot de passe
        hashed_password = get_password_hash(user_data["password"])
        
        # Créer l'utilisateur
        user = User(
            nom=user_data["nom"],
            email=user_data["email"],
            preference=user_data.get("preference"),
            hashed_password=hashed_password
        )
        
        # Sauvegarder en base
        users_collection = db_manager.get_mongodb_collection("users")
        result = await users_collection.insert_one(user.dict(by_alias=True))
        user.id = result.inserted_id
        
        logger.info(f"Utilisateur créé: {user.email}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la création de l'utilisateur: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user"
        )
