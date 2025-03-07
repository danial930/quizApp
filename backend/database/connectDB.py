from motor.motor_asyncio import AsyncIOMotorClient

from utils.logger import LoggData

MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "quizApp"


class MongoDB:
    def __init__(self):
        self.client = AsyncIOMotorClient(MONGODB_URL)

        try:
            LoggData.info("Database connected successfully.")
        except Exception as e:
            LoggData.error(f"Failed to connect to the database: {e}")

        self.db = self.client[DATABASE_NAME]

    async def close(self):
        self.client.close()


mongodb = MongoDB()
