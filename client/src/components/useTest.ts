import { useState, useRef } from "react";
import { getNRandomQuestion, Question, submitAnswer } from "../api";

type TestState = "INITIAL" | "RUNNING" | "FINISHED";
type SubmissionResult = "CORRECT" | "INCORRECT" | "UNKNOWN";

interface Answer {
  question: Question;
  answer: string;
  isCorrect: boolean;
}

export function useTest(NUMBER_OF_QUESTIONS: number) {
  const [testState, setTestState] = useState<TestState>("INITIAL");
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult>("UNKNOWN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const answers = useRef<Answer[]>([]);

  const [questionItr, setQuestionItr] =
    useState<ArrayIterator<[number, Question]>>();
  const [question, setQuestion] = useState<[number, Question]>();

  async function startTest() {
    setError("");
    try {
      const questions = await getNRandomQuestion(NUMBER_OF_QUESTIONS);
      if (questions.length !== NUMBER_OF_QUESTIONS) {
        setError(
          `Expected ${NUMBER_OF_QUESTIONS} questions but got ${questions.length}`
        );
        return;
      }
      const qItr = questions.entries();
      setQuestionItr(qItr);
      setQuestion(qItr.next().value);
      setTestState("RUNNING");
    } catch (err) {
      console.error("Error starting test:", err);
      setError("An error occurred while fetching questions.");
    }
  }

  async function submit() {
    if (!question) return;

    setIsSubmitting(true);
    try {
      const correct = await submitAnswer(question[1].id, answer);
      setSubmissionResult(correct === true ? "CORRECT" : "INCORRECT");

      answers.current.push({
        question: question[1],
        answer,
        isCorrect: correct === true,
      });
    } catch (err) {
      console.error("Error submitting answer:", err);
      setSubmissionResult("UNKNOWN");
    } finally {
      setIsSubmitting(false);
    }
  }

  function nextQuestion() {
    if (!questionItr) return;

    const nextQ = questionItr.next().value;
    if (!nextQ) {
      setTestState("FINISHED");
      return;
    }
    setQuestion(nextQ);
    setAnswer("");
    setSubmissionResult("UNKNOWN");
  }

  function restartTest() {
    answers.current = [];
    setTestState("INITIAL");
    setAnswer("");
    setSubmissionResult("UNKNOWN");
    startTest();
  }

  return {
    testState,
    error,
    answer,
    submissionResult,
    isSubmitting,
    question,
    answers,
    startTest,
    submit,
    nextQuestion,
    restartTest,
    setAnswer,
  };
}
