export type TestType = "2008" | "2025";

export interface TestConfig {
  testType: TestType;
  totalQuestions: number;
  questionsAsked: number;
  passThreshold: number;
  description: string;
  filingDateInfo: string;
}

export type Question = {
  id: number;
  question: string;
  answers?: string[];
};

export const getTestConfigs = async (): Promise<TestConfig[]> => {
  const res = await fetch("/api/test-configs");
  const j: { configs: TestConfig[] } = await res.json();
  return j.configs;
};

export const getNRandomQuestion = async (
  n: number,
  testType: TestType = "2008"
): Promise<Question[]> => {
  const res = await fetch(
    `/api/questions?n=${parseInt(n.toString())}&testType=${testType}`
  );

  const j: {
    questions: Question[];
  } = await res.json();

  return j["questions"].map((jq) => ({
    id: jq["id"],
    question: jq["question"],
    answers: jq["answers"],
  }));
};

export const getRandomQuestion = async (
  testType: TestType = "2008"
): Promise<Question> => {
  const res = await fetch(`/api/questions/-1?testType=${testType}`);
  const j = await res.json();

  return {
    id: j["id"],
    question: j["question"],
    answers: j["answers"],
  };
};

export const submitAnswer = async (
  questionId: number,
  answer: string,
  testType: TestType = "2008"
) => {
  const res = await fetch(`/api/submit-answer/${questionId}?testType=${testType}`, {
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

export const getDynamicQuestions = async (
  testType: TestType = "2008"
): Promise<Question[]> => {
  const res = await fetch(`/api/dynamic-questions?testType=${testType}`);
  const j: {
    questions: Question[];
  } = await res.json();

  return j["questions"].map((jq) => ({
    id: jq["id"],
    question: jq["question"],
    answers: jq["answers"],
  }));
};
