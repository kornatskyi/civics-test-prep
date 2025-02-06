import asyncio
import logging
from random import sample
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from src.Dependencies import get_LLMClient_service, get_questions_service
from src.LLMClient import LLMClient
from src.QuestionsService import QuestionsService
from typing import Annotated
from contextlib import asynccontextmanager

# Configure logging to output to both the console and a file
logging.basicConfig(
    level=logging.INFO,  # Adjust the logging level as needed
    format="%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d - %(funcName)s()] - %(message)s",
    handlers=[
        logging.StreamHandler(),  # Log to console
        logging.FileHandler(
            "app.log", mode="a"
        ),  # Log to file; 'a' appends to the file
    ],
)

# Load environment variables
load_dotenv()


# Task do update questions periodically
async def scheduled_dynamic_questions_update_task(questions_service: QuestionsService):
    while True:
        logging.info("Running scheduled task to update dynamic questions")
        try:
            await questions_service.update_dynamic_questions()
        except Exception as e:
            logging.exception(f"Error updating dynamic questions. Error message: {e}")
        await asyncio.sleep(7 * 24 * 60 * 60)  # run this task every 7 days


class Answer(BaseModel):
    answer: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Application startup: initializing services")
    questions_service: QuestionsService = get_questions_service()
    background_task = asyncio.create_task(
        scheduled_dynamic_questions_update_task(questions_service)
    )
    try:
        yield
    finally:
        if background_task:
            background_task.cancel()  # Cancel the task
            try:
                await background_task  # Ensure it exits cleanly
            except asyncio.CancelledError:
                logging.info("Background task stopped.")


app = FastAPI(lifespan=lifespan)

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
    questions_service: Annotated[QuestionsService, Depends(get_questions_service)],
):
    all_questions = questions_service.get_all_questions()
    if len(all_questions) < n:
        logging.warning(
            "Requested number of questions (%d) exceeds available questions (%d)",
            n,
            len(all_questions),
        )
    selected_questions = sample(all_questions, n)
    logging.info("Returning %d questions", n)
    return {"questions": selected_questions}


@app.get("/api/questions/{question_id}")
def read_question(
    question_id: int,
    questions_service: Annotated[QuestionsService, Depends(get_questions_service)],
):
    try:
        if question_id == -1:
            all_questions = questions_service.get_all_questions()
            if not all_questions:
                logging.error("No questions available")
                raise HTTPException(status_code=404, detail="No questions available")
            question = sample(all_questions, 1)[0]
        else:
            question = questions_service.get_question_by_id(question_id)
        logging.info("Returning question with id %d", question_id)
        return question
    except Exception as e:
        logging.exception("Error retrieving question with id %d", question_id)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Error retrieving question")


@app.post("/api/submit-answer/{question_id}")
async def submit_answer(
    question_id: int,
    answer: Answer,
    questions_service: Annotated[QuestionsService, Depends(get_questions_service)],
    llama_client: Annotated[LLMClient, Depends(get_LLMClient_service)],
):
    question = questions_service.get_question_by_id(question_id)
    prompt = f"""
        I will provide you with a question, correct answers to that question, and user's answer to that question. You should tell if user's answer is correct. It might not match exactly the actual answers but you still should understand what the user means from the context and be able to judge whether the answer is correct or incorrect. But be careful because some users' answers might be tricky; they still should match very closely to the actual answers and can't be too vague.
        Question: {question.question}
        Actual answers: {question.answers}
        User's answer: {answer.answer}
        
        Reply only with the word "Correct" for a correct user's answer or the word "Incorrect" for an incorrect user's answer.
        """
    logging.info("Submitting answer for question id %d", question_id)
    try:
        result = await llama_client.completion(prompt)
    except Exception as e:
        logging.exception(
            f"Error processing answer for question id %d. Error message: {e}",
            question_id,
        )
        raise HTTPException(status_code=500, detail="Error processing answer")
    is_correct = "Correct" in result
    logging.info(
        "Answer evaluated for question id %d: %s",
        question_id,
        "Correct" if is_correct else "Incorrect",
    )
    return {"result": "true" if is_correct else "false"}


@app.get("/api/dynamic-questions")
def get_dynamic_questions(
    questions_service: Annotated[QuestionsService, Depends(get_questions_service)],
):
    logging.info("Retrieving dynamic questions")
    return {"questions": questions_service.get_dynamic_questions()}
