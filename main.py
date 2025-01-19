from random import randint
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from src.Dependencies import get_questions_service
from src.QuestionsService import QuestionsService

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
    app.mount("/", StaticFiles(directory="client/dist", html=True), name="static")


@app.get("/api/questions")
def read_questions(
    questions_service: QuestionsService = Depends(get_questions_service),
):
    return {"questions": questions_service.get_all_questions()}


@app.get("/api/questions/{question_id}")
def read_question(
    question_id: int,
    questions_service: QuestionsService = Depends(get_questions_service),
):
    try:
        question = {}
        if question_id == -1:
            random_id = randint(0, len(questions_service.questions) - 1)
            question = questions_service.get_question_by_id(random_id)
        else:
            question = questions_service.get_question_by_id(question_id)
        return {"question": question["question"], "id": question["number"]}
    except IndexError:
        raise HTTPException(status_code=404, detail="Question not found")


@app.post("/api/submit-answer/{question_id}")
def submit_answer(
    question_id: int,
    questions_service: QuestionsService = Depends(get_questions_service),
):
    # Example: Validate answer (you can enhance this with actual validation logic)
    question = questions_service.get_question_by_id(question_id)
    return {"result": f"Your answer is validated for question: {question}"}
