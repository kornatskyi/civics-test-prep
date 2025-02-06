from src.LLMClient import LLMClient
from src.QuestionsService import QuestionsService


questions_service = QuestionsService()


def get_questions_service():
    return questions_service


llama_client = LLMClient()


def get_LLMClient_service():
    return llama_client
