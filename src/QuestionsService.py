import json
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

        # If the JSON field doesn't exist, last_time_updated might be None
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
            # We’ll store the datetime as an ISO string
            "lastTimeUpdated": self.last_time_updated,
        }


class QuestionsService:
    def __init__(self, questions_file_path: str = "./db/100_civics_questions.json"):
        self.questions_file_path = questions_file_path
        self.llm_client = LLMClient()

        # Load questions from the JSON file
        with open(self.questions_file_path, "r") as file:
            data = json.load(file)
            self.questions: list[Question] = []
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

        # For convenience, define a mapping from question ID (or question text)
        # to the function that retrieves the latest data from LLM or websites.
        # Adjust these IDs as they appear in your JSON.
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

        The updated data is stored as plain text in the 'answers' field.
        After updating, we save to the JSON file.
        """
        now = datetime.now()

        for question in self.get_dynamic_questions():
            # Decide if we need to update based on the 'lastTimeUpdated' field
            last_updated = None
            if question.last_time_updated:
                try:
                    last_updated = datetime.fromisoformat(question.last_time_updated)
                except ValueError:
                    # If parsing fails, we assume we need to update
                    last_updated = None

            needs_update = False
            if last_updated is None:
                needs_update = True
            else:
                # Compare with current time
                delta = now - last_updated
                if delta > timedelta(days=update_interval_days):
                    needs_update = True

            if needs_update:
                print(f"Updating question {question.id} - {question.question}")

                # Call the appropriate function if we have it
                func = self.dynamic_question_map.get(question.id, None)
                if func is None:
                    # Not mapped or not implemented; skip
                    print(f"No function mapped for question {question.id}. Skipping.")
                    continue

                try:
                    raw_result = await func(self.llm_client)

                    if isinstance(raw_result, str):
                        updated_answer = raw_result.strip()
                    else:
                        updated_answer = str(raw_result)

                    question.answers = [updated_answer]

                    # Update the timestamp
                    question.last_time_updated = now.isoformat()

                except Exception as e:
                    print(f"Failed to update question {question.id}: {e}")
                    continue

        self._save_questions_to_json()

    def _save_questions_to_json(self) -> None:
        """
        Persists the current list of questions to the JSON file,
        including the updated answers and timestamps.
        """
        data_to_save = {"questions": [q.to_dict() for q in self.questions]}
        with open(self.questions_file_path, "w") as f:
            json.dump(data_to_save, f, indent=2)
