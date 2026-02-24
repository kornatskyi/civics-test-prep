import asyncio
import logging
from random import sample
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from src.Dependencies import get_gemini_client, get_questions_service
from src.LLMClient import LLMClient
from src.QuestionsService import QuestionsService, TestType
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

DYNAMIC_UPDATE_INTERVAL_DAYS = int(os.getenv("DYNAMIC_UPDATE_INTERVAL_DAYS", "30"))
ENABLE_DYNAMIC_QUESTION_UPDATES = (
    os.getenv("ENABLE_DYNAMIC_QUESTION_UPDATES", "false").lower() == "true"
)
RUN_DYNAMIC_UPDATE_ON_STARTUP = (
    os.getenv("RUN_DYNAMIC_UPDATE_ON_STARTUP", "false").lower() == "true"
)


# Task do update questions periodically
async def scheduled_dynamic_questions_update_task(questions_service: QuestionsService):
    update_interval_days = DYNAMIC_UPDATE_INTERVAL_DAYS
    if not RUN_DYNAMIC_UPDATE_ON_STARTUP:
        await asyncio.sleep(update_interval_days * 24 * 60 * 60)
    while True:
        logging.info("Running scheduled task to update dynamic questions")
        try:
            await questions_service.update_dynamic_questions(update_interval_days)
        except Exception as e:
            logging.exception(f"Error updating dynamic questions. Error message: {e}")
        await asyncio.sleep(
            (update_interval_days + 1) * 24 * 60 * 60
        )  # run this task every 31 days


class Answer(BaseModel):
    answer: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Application startup: initializing services")
    questions_service: QuestionsService = get_questions_service()
    background_task: asyncio.Task[None] | None = None
    if ENABLE_DYNAMIC_QUESTION_UPDATES:
        background_task = asyncio.create_task(
            scheduled_dynamic_questions_update_task(questions_service)
        )
    else:
        logging.info("Dynamic question background updates are disabled")
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
STATIC_DIR = "client/dist"


@app.get("/api/test-configs")
def get_test_configs(
    questions_service: Annotated[QuestionsService, Depends(get_questions_service)],
):
    """Return all available test configurations."""
    logging.info("Retrieving test configurations")
    return {"configs": questions_service.get_test_configs()}


@app.get("/api/questions")
def read_questions(
    n: int,
    questions_service: Annotated[QuestionsService, Depends(get_questions_service)],
    test_type: Annotated[TestType, Query(alias="testType")] = TestType.TEST_2008,
):
    """Get n random questions for a specific test type."""
    all_questions = questions_service.get_all_questions(test_type)
    if len(all_questions) < n:
        logging.warning(
            "Requested number of questions (%d) exceeds available questions (%d) for test type %s",
            n,
            len(all_questions),
            test_type.value,
        )
        n = len(all_questions)
    selected_questions = sample(all_questions, n)
    logging.info("Returning %d questions for test type %s", n, test_type.value)
    return {"questions": selected_questions}


@app.get("/api/questions/{question_id}")
def read_question(
    question_id: int,
    questions_service: Annotated[QuestionsService, Depends(get_questions_service)],
    test_type: Annotated[TestType, Query(alias="testType")] = TestType.TEST_2008,
):
    """Get a specific question by ID for a specific test type."""
    try:
        if question_id == -1:
            all_questions = questions_service.get_all_questions(test_type)
            if not all_questions:
                logging.error(
                    "No questions available for test type %s", test_type.value
                )
                raise HTTPException(status_code=404, detail="No questions available")
            question = sample(all_questions, 1)[0]
        else:
            question = questions_service.get_question_by_id(test_type, question_id)
        logging.info(
            "Returning question with id %d for test type %s",
            question_id,
            test_type.value,
        )
        return question
    except IndexError as e:
        logging.exception("Question not found: %s", str(e))
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logging.exception("Error retrieving question with id %d", question_id)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Error retrieving question")


# System instruction for answer evaluation - used as LLM system prompt
ANSWER_EVALUATION_SYSTEM_INSTRUCTION = """You are an evaluator for U.S. civics test answers. You will be given a question, the correct answers, and a user's answer. You must determine if the user's answer is correct.

Guidelines:
- The user's answer must not contain any incorrect information. If the user provides a list of items, all items in that list must be correct.
- The answer doesn't need to match exactly - understand what the user means from context
- For names of people: accept minor misspellings, different name orders (FirstName LastName vs LastName FirstName), and partial matches if the person is clearly identifiable
- For questions about representatives/senators/governors: if the user names a correct person for ANY state/district, mark it correct (since the question asks about "your" state)
- Be lenient with spelling variations but strict about the actual content being correct
- The answer can't be too vague or generic
- You should only compare the users answer to the Actual answers
- You should judge in what cases the user provided enough information for the answer to be considered correct, and when it's not enough
- You should judge the answer the same way an average officer on the naturalization interview would judge it

Reply only with the word "Correct" for a correct user's answer or the word "Incorrect" for an incorrect user's answer."""


@app.post("/api/submit-answer/{question_id}")
async def submit_answer(
    question_id: int,
    answer: Answer,
    questions_service: Annotated[QuestionsService, Depends(get_questions_service)],
    gemini_client: Annotated[LLMClient, Depends(get_gemini_client)],
    test_type: Annotated[TestType, Query(alias="testType")] = TestType.TEST_2008,
):
    """Submit an answer for evaluation."""
    question = questions_service.get_question_by_id(test_type, question_id)
    prompt = f"""Question: {question.question}
Actual answers: {question.answers}
User's answer: {answer.answer}"""
    logging.info(
        "Submitting answer for question id %d (test type: %s)",
        question_id,
        test_type.value,
    )
    try:
        result = await gemini_client.completion(
            prompt,
            system_instruction=ANSWER_EVALUATION_SYSTEM_INSTRUCTION,
            max_output_tokens=8,
        )
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
    test_type: Annotated[TestType, Query(alias="testType")] = TestType.TEST_2008,
):
    """Get all dynamic questions for a specific test type."""
    logging.info("Retrieving dynamic questions for test type %s", test_type.value)
    return {"questions": questions_service.get_dynamic_questions(test_type)}


# Serve static frontend files in production
# This must be mounted AFTER all API routes to ensure API routes take precedence
if PRODUCTION and os.path.isdir(STATIC_DIR):
    # Mount static assets (js, css, images, etc.)
    app.mount("/assets", StaticFiles(directory=f"{STATIC_DIR}/assets"), name="assets")

    # Serve index.html for the root path and any non-API paths (SPA catch-all)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the SPA for all non-API routes."""
        # Check if it's a static file that exists
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise serve index.html for SPA client-side routing
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
