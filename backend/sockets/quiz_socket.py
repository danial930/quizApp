from typing import Dict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from database.connectDB import mongodb

router = APIRouter()


# Store WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.students = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        if client_id in self.students:
            del self.students[client_id]

    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            await connection.send_json(message)


quiz_collection = mongodb.db.get_collection("quizzes")


class Student(BaseModel):
    id: str
    name: str
    status: str
    score: int


connected_students = {}


manager = ConnectionManager()


@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)

    try:
        # Send initial connection confirmation
        await websocket.send_json({"type": "connected", "data": {"id": client_id}})

        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")

            if event_type == "studentConnect":
                student_data = {
                    "id": client_id,
                    "name": data.get("name"),
                    "status": "connected",
                    "score": 0,
                }
                manager.students[client_id] = student_data

                quiz = await quiz_collection.find_one({"_id": data.get("quizId")})
                if quiz:
                    await websocket.send_json({"type": "quizData", "data": quiz})
                await manager.broadcast(
                    {"type": "studentConnected", "data": student_data}
                )

            elif event_type == "studentProgress":
                if client_id in manager.students:
                    manager.students[client_id]["score"] = data.get("score", 0)
                    await manager.broadcast(
                        {"type": "studentProgress", "data": manager.students[client_id]}
                    )

            elif event_type == "startQuiz":
                await manager.broadcast(
                    {"type": "quizStarted", "data": data.get("quizId")}
                )

            elif event_type == "quizFinished":
                if client_id in manager.students:
                    manager.students[client_id]["status"] = data.get(
                        "status", "finished"
                    )
                    await manager.broadcast(
                        {"type": "studentFinished", "data": manager.students[client_id]}
                    )

    except WebSocketDisconnect:
        manager.disconnect(client_id)
        await manager.broadcast(
            {"type": "studentDisconnected", "data": {"id": client_id}}
        )


# manager = ConnectionManager()
# Generate a random quiz ID
# @app.get("/create_quiz")
# async def generate_quiz_id(length: int = 8) -> str:
#     return "".join(random.choices(string.ascii_letters + string.digits, k=length))


# # WebSocket endpoint
# @app.websocket("/ws/{quiz_id}")
# async def websocket_endpoint(websocket: WebSocket, quiz_id: str):
#     await manager.connect(quiz_id, websocket)
#     try:
#         while True:
#             data = await websocket.receive_text()
#             await manager.broadcast(quiz_id, data)
#     except WebSocketDisconnect:
#         manager.disconnect(quiz_id, websocket)
