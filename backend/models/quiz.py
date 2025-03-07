from datetime import datetime
from typing import Annotated, List, Optional

from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field

# Helper for ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]


class Option(BaseModel):
    id: str = Field(..., description="Unique identifier for the option")
    text: str = Field(..., description="Text of the option")
    isCorrect: bool = Field(..., description="Indicates if the option is correct")
    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str, datetime: lambda dt: dt.isoformat()},
        json_schema_extra={
            "example": {
                "id": "option1",
                "text": "Paris",
                "isCorrect": True,
            }
        },
    )


class Question(BaseModel):
    id: str = Field(..., description="Unique identifier for the question")
    text: str = Field(..., description="Text of the question")
    options: List[Option] = Field(..., description="List of options for the question")

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str, datetime: lambda dt: dt.isoformat()},
        json_schema_extra={
            "example": {
                "id": "question1",
                "text": "What is the capital of France?",
                "options": [
                    {"id": "option1", "text": "Paris", "isCorrect": True},
                    {"id": "option2", "text": "London", "isCorrect": False},
                    {"id": "option3", "text": "Berlin", "isCorrect": False},
                    {"id": "option4", "text": "Madrid", "isCorrect": False},
                ],
            }
        },
    )


# email: EmailStr = Field(..., description="Email of the quiz creator")


class Quiz(BaseModel):
    id: Optional[PyObjectId] = Field(
        alias="_id", default=None, description="id for mongodb entry"
    )
    topic: str = Field(..., description="Topic of the quiz")
    questions: List[Question] = Field(..., description="List of questions in the quiz")
    scheduledFor: Optional[datetime] = Field(
        None, description="Scheduled date and time for the quiz"
    )
    status: str = Field(
        ...,
        description="Status of the quiz",
        pattern="^(draft|scheduled|active|completed)$",
    )

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "_id": "656ef1d5e3b3c8d2fbd12345",
                "topic": "Geography Quiz",
                "scheduledFor": "2025-01-30T10:00:00",
                "status": "scheduled",
                "email": "teacher@example.com",
                "questions": [
                    {
                        "id": "question1",
                        "text": "What is the capital of France?",
                        "options": [
                            {"id": "option1", "text": "Paris", "isCorrect": True},
                            {"id": "option2", "text": "London", "isCorrect": False},
                            {"id": "option3", "text": "Berlin", "isCorrect": False},
                            {"id": "option4", "text": "Madrid", "isCorrect": False},
                        ],
                    },
                    {
                        "id": "question2",
                        "text": "Which continent is known as the Dark Continent?",
                        "options": [
                            {"id": "option5", "text": "Asia", "isCorrect": False},
                            {"id": "option6", "text": "Africa", "isCorrect": True},
                            {"id": "option7", "text": "Europe", "isCorrect": False},
                            {"id": "option8", "text": "Australia", "isCorrect": False},
                        ],
                    },
                ],
            }
        },
    )
