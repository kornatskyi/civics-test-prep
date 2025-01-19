from src.LLaMaClient import LLaMaClient
from src.QuestionsService import QuestionsService


questions_service = QuestionsService()


def get_questions_service():
    return questions_service


llama_client = LLaMaClient()

def get_LLaMaClient_service():
  return llama_client
  