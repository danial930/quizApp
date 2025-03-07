from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from CRUD.quiz import router as quizRouter
from CRUD.teacher import router as teacherRouter
from database.connectDB import mongodb
from sockets.quiz_socket import router as socketRouter
from utils.auth import router as authRouter


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await mongodb.close()


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(socketRouter)
app.include_router(authRouter)
app.include_router(quizRouter)
app.include_router(teacherRouter)
