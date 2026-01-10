from src.LLMClient import LLMClient
from src.QuestionsService import QuestionsService


questions_service = QuestionsService()


def get_questions_service():
    return questions_service


gemini_client = LLMClient()


def get_gemini_client():
    return gemini_client
