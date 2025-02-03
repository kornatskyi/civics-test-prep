from random import sample
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from src.Dependencies import get_LLMClient_service, get_questions_service
from src.LLMClient import LLMClient
from src.QuestionsService import Question, QuestionsService


# Define a Pydantic model for the request body
class Answer(BaseModel):
    answer: str


# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or more restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get PRODUCTION value from environment variables
PRODUCTION = os.getenv("PRODUCTION", "False").lower() == "true"

if PRODUCTION:
    app.mount("/static", StaticFiles(directory="client/dist", html=True), name="static")


@app.get("/api/questions")
def read_questions(
    n: int,
    questions_service: QuestionsService = Depends(get_questions_service),
):
    return {"questions": sample(questions_service.get_all_questions(), n)}


@app.get("/api/questions/{question_id}")
def read_question(
    question_id: int,
    questions_service: QuestionsService = Depends(get_questions_service),
):
    try:
        question = Question()
        if question_id == -1:
            question = sample(questions_service.get_all_questions(), 1)[0]
        else:
            question = questions_service.get_question_by_id(question_id)
        return question
    except IndexError:
        raise HTTPException(status_code=404, detail="Question not found")


@app.post("/api/submit-answer/{question_id}")
def submit_answer(
    question_id: int,
    answer: Answer,
    questions_service: QuestionsService = Depends(get_questions_service),
    llama_client: LLMClient = Depends(get_LLMClient_service),
):
    # Example: Validate answer (you can enhance this with actual validation logic)
    question = questions_service.get_question_by_id(question_id)
    prompt = f"""
        I will provide you with a question, correct answers to that question, and user's answer to that question. You should tell if user's answer is correct. It might not match exactly the actual answers but you still should understand what the user mean form the context and be able to judge weather the answer is correct or incorrect. But be careful because some users answers might be tricky, they still should match very closely to the actual answers and can't be too wage.
        Question: {question.question}
        Actual answers: {question.answers}
        User's answer: {answer.answer}
        
        Reply only with the word "Correct" for a correct user's answer or the word "Incorrect" for an incorrect user's answer.
        """

    result = llama_client.completion(prompt)

    return {"result": "true" if "Correct" in result else "false"}


@app.get("/api/dynamic-questions")
def get_dynamic_questions(
    questions_service: QuestionsService = Depends(get_questions_service),
):
    return {"questions": questions_service.get_dynamic_questions()}


# @app.get("/api/update-dynamic-questions")
# def update_dynamic_questions(
#     questions_service: QuestionsService = Depends(get_questions_service),
# ):
#     !TODO: remove this endpoint and make a job that will update dynamic questions periodically
#     questions_service.update_dynamic_questions()
#     return {"questions": questions_service.get_dynamic_questions()}
