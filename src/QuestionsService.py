import json
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import List, Dict, Any
from src.LLMClient import LLMClient
from src.AnswersToDynamicQuestions import (
    DynamicQuestionFetcher,
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


class TestType(str, Enum):
    TEST_2008 = "2008"  # 100 questions, 10 asked, 6 to pass
    TEST_2025 = "2025"  # 128 questions, 20 asked, 12 to pass


@dataclass
class TestConfig:
    test_type: TestType
    questions_file: str
    total_questions: int
    questions_asked: int
    pass_threshold: int
    description: str
    filing_date_info: str


# Test configuration for each test type
TEST_CONFIGS: Dict[TestType, TestConfig] = {
    TestType.TEST_2008: TestConfig(
        test_type=TestType.TEST_2008,
        questions_file="./db/100_civics_questions.json",
        total_questions=100,
        questions_asked=10,
        pass_threshold=6,
        description="2008 Civics Test (100 Questions)",
        filing_date_info="For applications filed BEFORE October 20, 2025",
    ),
    TestType.TEST_2025: TestConfig(
        test_type=TestType.TEST_2025,
        questions_file="./db/128_civics_questions_2025.json",
        total_questions=128,
        questions_asked=20,
        pass_threshold=12,
        description="2025 Civics Test (128 Questions)",
        filing_date_info="For applications filed ON OR AFTER October 20, 2025",
    ),
}

# Dynamic question ID mappings for each test type
# 2008 test uses different question IDs than 2025 test
DYNAMIC_QUESTION_MAP_2008: Dict[int, DynamicQuestionFetcher] = {
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

DYNAMIC_QUESTION_MAP_2025: Dict[int, DynamicQuestionFetcher] = {
    61: get_governor_by_state,  # "Who is the governor of your state now?"
    23: get_senators_by_state,  # "Who is one of your state's U.S. senators now?"
    29: get_representative,  # "Name your U.S. representative."
    38: get_president,  # "What is the name of the President of the United States now?"
    39: get_vice_president,  # "What is the name of the Vice President of the United States now?"
    57: get_chief_justice,  # "Who is the Chief Justice of the United States now?"
    62: get_state_capital,  # "What is the capital of your state?"
    30: get_speaker_of_the_house,  # "What is the name of the Speaker of the House of Representatives now?"
}


class Question:
    def __init__(
        self,
        id: int,
        section: str,
        question: str,
        answers: List[str],
        is_required_for_65_plus: bool,
        is_dynamic_answer: bool,
        last_time_updated: str | None,
    ):
        self.id = id
        self.section = section
        self.question = question
        self.answers = answers
        self.is_required_for_65_plus = is_required_for_65_plus
        self.is_dynamic_answer = is_dynamic_answer
        self.last_time_updated = last_time_updated

    def __repr__(self) -> str:
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
    def __init__(self) -> None:
        self.llm_client = LLMClient()
        self.question_banks: Dict[TestType, List[Question]] = {}
        self.question_by_ids: Dict[TestType, Dict[int, Question]] = {}

        # Load all question banks
        for test_type, config in TEST_CONFIGS.items():
            self._load_questions(test_type, config.questions_file)

    def _load_questions(self, test_type: TestType, file_path: str) -> None:
        """Load questions from a JSON file for a specific test type."""
        logger.info("Loading questions for %s from %s", test_type.value, file_path)
        try:
            with open(file_path, "r") as file:
                data = json.load(file)
                questions: List[Question] = []
                for q in data["questions"]:
                    question_obj = Question(
                        id=q["id"],
                        section=q["section"],
                        question=q["question"],
                        answers=q["answers"],
                        is_required_for_65_plus=q.get("isRequiredFor65Plus", False),
                        is_dynamic_answer=q.get("isDynamicAnswer", False),
                        last_time_updated=q.get("lastTimeUpdated", None),
                    )
                    questions.append(question_obj)

                self.question_banks[test_type] = questions
                self.question_by_ids[test_type] = {q.id: q for q in questions}
                logger.info("Loaded %d questions for %s.", len(questions), test_type.value)
        except FileNotFoundError:
            logger.error("Questions file not found: %s", file_path)
            self.question_banks[test_type] = []
            self.question_by_ids[test_type] = {}

    def get_test_configs(self) -> List[Dict[str, Any]]:
        """Return all available test configurations."""
        return [
            {
                "testType": config.test_type.value,
                "totalQuestions": config.total_questions,
                "questionsAsked": config.questions_asked,
                "passThreshold": config.pass_threshold,
                "description": config.description,
                "filingDateInfo": config.filing_date_info,
            }
            for config in TEST_CONFIGS.values()
        ]

    def get_all_questions(
        self, test_type: TestType, are_dynamic_questions_included: bool = True
    ) -> List[Question]:
        """Get all questions for a specific test type."""
        questions = self.question_banks.get(test_type, [])
        if are_dynamic_questions_included:
            return questions
        else:
            return [q for q in questions if not q.is_dynamic_answer]

    def get_question_by_id(self, test_type: TestType, question_id: int) -> Question:
        """Get a specific question by ID for a specific test type."""
        question_map = self.question_by_ids.get(test_type, {})
        question = question_map.get(question_id)
        if question is not None:
            return question
        raise IndexError(f"Question ID {question_id} not found in {test_type.value} test")

    def get_dynamic_questions(self, test_type: TestType) -> List[Question]:
        """Get all dynamic questions for a specific test type."""
        questions = self.question_banks.get(test_type, [])
        return [q for q in questions if q.is_dynamic_answer]

    def _get_dynamic_question_map(self, test_type: TestType) -> Dict[int, DynamicQuestionFetcher]:
        """Get the dynamic question map for a specific test type."""
        if test_type == TestType.TEST_2008:
            return DYNAMIC_QUESTION_MAP_2008
        else:
            return DYNAMIC_QUESTION_MAP_2025

    async def update_dynamic_questions(self, update_interval_days: int = 1) -> None:
        """
        Updates answers for all dynamic questions in all test banks
        if their 'lastTimeUpdated' is older than 'update_interval_days'.
        """
        now = datetime.now()
        logger.info(
            "Starting update of dynamic questions with an interval of %d day(s).",
            update_interval_days,
        )

        for test_type in TestType:
            dynamic_map = self._get_dynamic_question_map(test_type)
            
            for question in self.get_dynamic_questions(test_type):
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
                    logger.info(
                        "Updating question %d (%s) - %s",
                        question.id,
                        test_type.value,
                        question.question,
                    )

                    func = dynamic_map.get(question.id, None)
                    if func is None:
                        logger.warning(
                            "No function mapped for question %d in %s. Skipping update.",
                            question.id,
                            test_type.value,
                        )
                        continue

                    try:
                        raw_result = await func(self.llm_client)
                        updated_answer = raw_result.strip()
                        question.answers = [updated_answer]
                        question.last_time_updated = now.isoformat()
                        logger.info(
                            "Updated question %d with new answer: %s",
                            question.id,
                            updated_answer[:100] + "..." if len(updated_answer) > 100 else updated_answer,
                        )
                    except Exception as e:
                        logger.exception("Failed to update question %d: %s", question.id, e)
                        continue

            self._save_questions_to_json(test_type)

    def _save_questions_to_json(self, test_type: TestType) -> None:
        """
        Persists the questions for a specific test type to its JSON file.
        """
        config = TEST_CONFIGS.get(test_type)
        if config is None:
            logger.error("No config found for test type: %s", test_type.value)
            return

        questions = self.question_banks.get(test_type, [])
        data_to_save = {"questions": [q.to_dict() for q in questions]}
        
        try:
            with open(config.questions_file, "w") as f:
                json.dump(data_to_save, f, indent=2)
            logger.info("Saved updated questions to %s", config.questions_file)
        except Exception as e:
            logger.exception(
                "Failed to save questions to %s: %s", config.questions_file, e
            )
