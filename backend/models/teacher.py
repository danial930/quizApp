from typing import Optional

from pydantic import BaseModel


class Teacher(BaseModel):
    name: Optional[str] = None
    email: str
    password: str
