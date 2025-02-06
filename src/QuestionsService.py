import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from src.LLMClient import LLMClient
from src.AnswersToDynamicQuestions import (
    get_governor_by_state,
    get_senators_by_state,
    get_representative,
    get_president,
    get_vice_president,
    get_supreme_court_justice_count,
    get_chief_justice,
    get_state_capital,
    get_president_party,
    get_speaker_of_the_house,
)

# Create a module-level logger.
logger = logging.getLogger(__name__)


class Question:
    def __init__(
        self,
        id: int,
        section: str,
        question: str,
        answers: List[str],
        is_required_for_65_plus: bool,
        is_dynamic_answer: bool,
        last_time_updated: str,  # Optional
    ):
        self.id = id
        self.section = section
        self.question = question
        self.answers = answers
        self.is_required_for_65_plus = is_required_for_65_plus
        self.is_dynamic_answer = is_dynamic_answer
        self.last_time_updated = last_time_updated

    def __repr__(self):
        return (
            f"Question(id={self.id}, section='{self.section}', question='{self.question}', "
            f"answers={self.answers}, is_required_for_65_plus={self.is_required_for_65_plus}, "
            f"is_dynamic_answer={self.is_dynamic_answer}, last_time_updated={self.last_time_updated})"
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "section": self.section,
            "question": self.question,
            "answers": self.answers,
            "isRequiredFor65Plus": self.is_required_for_65_plus,
            "isDynamicAnswer": self.is_dynamic_answer,
            "lastTimeUpdated": self.last_time_updated,
        }


class QuestionsService:
    def __init__(self, questions_file_path: str = "./db/100_civics_questions.json"):
        self.questions_file_path = questions_file_path
        self.llm_client = LLMClient()

        logger.info("Loading questions from %s", self.questions_file_path)
        # Load questions from the JSON file
        with open(self.questions_file_path, "r") as file:
            data = json.load(file)
            self.questions: List[Question] = []
            for q in data["questions"]:
                # Safely retrieve "lastTimeUpdated"
                last_time_updated = q.get("lastTimeUpdated", None)

                question_obj = Question(
                    id=q["id"],
                    section=q["section"],
                    question=q["question"],
                    answers=q["answers"],
                    is_required_for_65_plus=q["isRequiredFor65Plus"],
                    is_dynamic_answer=q.get("isDynamicAnswer", False),
                    last_time_updated=last_time_updated,
                )
                self.questions.append(question_obj)

            # Create a dictionary for quick lookups
            self.question_by_ids = {q.id: q for q in self.questions}

        logger.info("Loaded %d questions.", len(self.questions))

        # Mapping from question ID to the function that retrieves the latest data.
        self.dynamic_question_map = {
            43: get_governor_by_state,  # "Who is the Governor of your state now?"
            20: get_senators_by_state,  # "Who is one of your state's U.S. Senators now?"
            23: get_representative,  # "Name your U.S. Representative."
            28: get_president,  # "What is the name of the President of the United States now?"
            29: get_vice_president,  # "What is the name of the Vice President of the United States now?"
            39: get_supreme_court_justice_count,  # "How many justices are on the Supreme Court?"
            40: get_chief_justice,  # "Who is the Chief Justice of the United States now?"
            44: get_state_capital,  # "What is the capital of your state?"
            46: get_president_party,  # "What is the political party of the President now?"
            47: get_speaker_of_the_house,  # "What is the name of the Speaker of the House of Representatives now?"
        }

    def get_all_questions(
        self, are_dynamic_questions_included: bool = True
    ) -> List[Question]:
        if are_dynamic_questions_included:
            return self.questions
        else:
            return [q for q in self.questions if not q.is_dynamic_answer]

    def get_question_by_id(self, question_id: int) -> Question:
        question = self.question_by_ids.get(question_id)
        if question is not None:
            return question
        raise IndexError("Question ID out of range")

    def get_dynamic_questions(self) -> List[Question]:
        return [q for q in self.questions if q.is_dynamic_answer]

    async def update_dynamic_questions(self, update_interval_days: int = 1) -> None:
        """
        Updates answers for all dynamic questions if their 'lastTimeUpdated'
        is older than 'update_interval_days', or if it doesn't exist at all.
        """
        now = datetime.now()
        logger.info(
            "Starting update of dynamic questions with an interval of %d day(s).",
            update_interval_days,
        )

        for question in self.get_dynamic_questions():
            last_updated = None
            if question.last_time_updated:
                try:
                    last_updated = datetime.fromisoformat(question.last_time_updated)
                except ValueError:
                    logger.warning(
                        "Could not parse lastTimeUpdated for question %d; updating anyway.",
                        question.id,
                    )
                    last_updated = None

            needs_update = False
            if last_updated is None:
                needs_update = True
            else:
                delta = now - last_updated
                if delta > timedelta(days=update_interval_days):
                    needs_update = True

            if needs_update:
                logger.info("Updating question %d - %s", question.id, question.question)

                func = self.dynamic_question_map.get(question.id, None)
                if func is None:
                    logger.warning(
                        "No function mapped for question %d. Skipping update.",
                        question.id,
                    )
                    continue

                try:
                    raw_result = await func(self.llm_client)
                    updated_answer = (
                        raw_result.strip()
                        if isinstance(raw_result, str)
                        else str(raw_result)
                    )
                    question.answers = [updated_answer]
                    question.last_time_updated = now.isoformat()
                    logger.info(
                        "Updated question %d with new answer: %s",
                        question.id,
                        updated_answer,
                    )
                except Exception as e:
                    logger.exception("Failed to update question %d: %s", question.id, e)
                    continue

        self._save_questions_to_json()

    def _save_questions_to_json(self) -> None:
        """
        Persists the current list of questions to the JSON file,
        including the updated answers and timestamps.
        """
        data_to_save = {"questions": [q.to_dict() for q in self.questions]}
        try:
            with open(self.questions_file_path, "w") as f:
                json.dump(data_to_save, f, indent=2)
            logger.info("Saved updated questions to %s", self.questions_file_path)
        except Exception as e:
            logger.exception(
                "Failed to save questions to %s: %s", self.questions_file_path, e
            )
