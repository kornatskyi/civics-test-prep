import json


class QuestionsService:
    def __init__(self):
        # Load questions from the JSON file
        with open("./db/100_civics_questions.json", "r") as file:
            data = json.load(file)
            self.questions = data["questions"]
            self.question_by_ids = {
                question["number"]: question for question in self.questions
            }

    def get_all_questions(self):
        return self.questions

    def get_question_by_id(self, question_id: int):
        question = self.question_by_ids.get(question_id)
        if question != None:
            return question
        raise IndexError("Question ID out of range")
