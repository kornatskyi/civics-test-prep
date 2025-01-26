export type Question = {
  id: number;
  question: string;
  answers?: string[];
};

export const getNRandomQuestion = async (n: number): Promise<Question[]> => {
  const res = await fetch(`/api/questions?n=${parseInt(n.toString())}`);
  const j: {
    questions: Question[];
  } = await res.json();
  console.log(j);

  return j["questions"].map((jq) => ({
    id: jq["id"],
    question: jq["question"],
    answers: jq["answers"],
  }));
};

export const getRandomQuestion = async (): Promise<Question> => {
  const res = await fetch("/api/questions/25");
  const j = await res.json();
  console.log(j);

  return {
    id: j["id"],
    question: j["question"],
    answers: j["answers"],
  };
};

export const submitAnswer = async (questionId: number, answer: string) => {
  const res = await fetch(`/api/submit-answer/${questionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answer,
    }),
  });
  const j = await res.json();
  return j["result"] === "true";
};
