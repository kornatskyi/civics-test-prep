import json

from typing import List


class Question:
    def __init__(
        self,
        id: int,
        section: str,
        question: str,
        answers: List[str],
        is_required_for_65_plus: bool,
        is_dynamic_answer: bool,
    ):
        self.id = id
        self.section = section
        self.question = question
        self.answers = answers
        self.is_required_for_65_plus = is_required_for_65_plus
        self.is_dynamic_answer = is_dynamic_answer

    def __repr__(self):
        return (
            f"Question(id={self.id}, section='{self.section}', question='{self.question}', "
            f"answers={self.answers}, is_required_for_65_plus={self.is_required_for_65_plus}, is_dynamic_answer={self.is_dynamic_answer})"
        )

    def to_dict(self):
        return {
            "id": self.id,
            "section": self.section,
            "question": self.question,
            "answers": self.answers,
            "isRequiredFor65Plus": self.is_required_for_65_plus,
            "isDynamicAnswer": self.is_dynamic_answer,
        }


class QuestionsService:
    def __init__(self):
        # Load questions from the JSON file
        with open("./db/100_civics_questions.json", "r") as file:
            data = json.load(file)
            self.questions = [
                Question(
                    id=q["id"],
                    section=q["section"],
                    question=q["question"],
                    answers=q["answers"],
                    is_required_for_65_plus=q["isRequiredFor65Plus"],
                    is_dynamic_answer=q.get("isDynamicAnswer", False),
                )
                for q in data["questions"]
            ]
            self.question_by_ids = {q.id: q for q in self.questions}

    def get_all_questions(self, areDynamicQuestionsIncluded=True) -> list[Question]:
        if areDynamicQuestionsIncluded:
            return self.questions
        else:
            return [q for q in self.questions if not q.is_dynamic_answer]

    def get_question_by_id(self, question_id: int):
        question = self.question_by_ids.get(question_id)
        if question is not None:
            return question
        raise IndexError("Question ID out of range")

    def get_dynamic_questions(self) -> list[Question]:
        return [q for q in self.questions if q.is_dynamic_answer]
