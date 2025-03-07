from bson.json_util import dumps
from fastapi import APIRouter, Depends, HTTPException, status

from database.connectDB import mongodb
from models.quiz import Quiz
from utils.auth import decode_jwt

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Get the quizzes collection from the connected MongoDB instance
quiz_collection = mongodb.db.get_collection("quizzes")
router = APIRouter()


@router.post("/quizzes", status_code=status.HTTP_201_CREATED)
async def create_quiz(quiz: Quiz, email: str = Depends(decode_jwt)):
    """
    Create a new quiz.
    Checks if a quiz with the same topic already exists for the same email.
    """
    try:
        # Check for duplicate quiz (same topic & email)
        duplicate = await quiz_collection.find_one(
            {"topic": quiz.topic, "email": email}
        )
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quiz with this name already exists in your account",
            )

        quiz_dict = quiz.model_dump(by_alias=True)
        quiz_dict["email"] = email
        # Insert the new quiz document
        result = await quiz_collection.insert_one(quiz_dict)
        quiz_dict["_id"] = result.inserted_id
        return {"message": "Quiz stored successfully"}
    except Exception as e:
        print(e)


@router.get("/quizzes")
async def get_all_quizzes(email: str = Depends(decode_jwt)):
    try:
        quizzes = await quiz_collection.find({"email": email}).to_list(length=100)
        if not quizzes:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No quizzes found"
            )
        return {"message": "Quizzes fetched successfully", "data": dumps(quizzes)}
    except Exception as e:
        print(e)


@router.put("/quizzes/{quiz_id}")
async def update_quiz(
    quiz_id: str, updated_quiz: Quiz, email: str = Depends(decode_jwt)
):
    """
    Update an existing quiz.
    Checks for duplicate quiz (same topic & email) among other records.
    """
    # Check if quiz exists
    try:
        quiz = await quiz_collection.find_one({"_id": quiz_id})
        if not quiz:
            print(quiz_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found"
            )

        updated_quiz_dict = updated_quiz.model_dump(by_alias=True)
        # Ensure the _id is not updated accidentally
        updated_quiz_dict["_id"] = quiz_id
        updated_quiz_dict["email"] = email

        result = await quiz_collection.replace_one({"_id": quiz_id}, updated_quiz_dict)
        if result.modified_count == 1:
            return {"message": "Quiz updated successfully", "data": updated_quiz_dict}
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Quiz update failed"
        )

    except Exception as e:
        print(e)


@router.delete("/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: str):
    """
    Delete a quiz by its id.
    """
    result = await quiz_collection.delete_one({"_id": quiz_id})
    if result.deleted_count == 1:
        return {"message": "Quiz deleted successfully"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")


async def get_quiz_by_id(quiz_id: str):
    """
    Get a quiz by its ID.
    """
    try:
        quiz = await quiz_collection.find_one({"_id": quiz_id})
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found"
            )
        quiz2 = dumps(quiz)
        return {quiz2}
    except Exception as e:
        print(e)


# 1739037562905
