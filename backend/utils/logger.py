import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LoggData:

    def info(data: str):
        logger.info(data)

    def error(data: str):
        logger.error(data)
