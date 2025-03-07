from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, status
from jose import jwt
from passlib.context import CryptContext

from database.connectDB import mongodb
from models.teacher import Teacher

# JWT configuration
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


router = APIRouter()
# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

teacher_collection = mongodb.db.get_collection("teachers")


# Utility function to hash passwords
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# Utility function to verify passwords
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# Utility function to create JWT token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=1)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Sign-up function
@router.post("/signup")
async def signup(teacher: Teacher):
    try:
        existing_teacher = await teacher_collection.find_one({"email": teacher.email})
        if existing_teacher:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already has a Account",
            )

        # Hash the password before saving
        hashed_password = hash_password(teacher.password)

        # Insert teacher data with hashed password
        teacher_data = teacher.model_dump()
        teacher_data["password"] = hashed_password
        teacher_id = await teacher_collection.insert_one(teacher_data)
        if teacher_id.inserted_id:
            return {"message": "Signup successful"}

    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An error occurred during signup",
        )


# Login function
@router.post("/login")
async def login(teacher: Teacher):
    try:
        # Find teacher by email
        existing_teacher = await teacher_collection.find_one({"email": teacher.email})
        if not existing_teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid email or password",
            )

        # Verify password
        if not verify_password(teacher.password, existing_teacher["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Create JWT token
        access_token = create_access_token(data={"email": teacher.email})

        return {"token": access_token, "name": existing_teacher["name"]}

    except HTTPException as e:
        raise e
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An error occurred during login",
        )
