import json


class QuestionsService:
    def __init__(self):
        # Load questions from the JSON file
        with open("./db/100_civics_questions.json", "r") as file:
            data = json.load(file)
            self.questions = data["questions"]

    def get_all_questions(self):
        return self.questions

    def get_question_by_id(self, question_id: int):
        if 0 <= question_id < len(self.questions):
            return self.questions[question_id]
        raise IndexError("Question ID out of range")
