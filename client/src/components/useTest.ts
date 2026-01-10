import { useState, useRef } from "react";
import { getNRandomQuestion, Question, submitAnswer, TestType } from "../api";

type TestState = "INITIAL" | "RUNNING" | "FINISHED";

interface Answer {
  question: Question;
  answer: string;
  isCorrect: boolean;
}

export enum SubmissionResult {
  UNKNOWN,
  CORRECT,
  INCORRECT,
}

export interface TestSettings {
  testType: TestType;
  numberOfQuestions: number;
  passThreshold: number;
}

export function useTest(settings: TestSettings) {
  const { testType, numberOfQuestions, passThreshold } = settings;
  
  const [testState, setTestState] = useState<TestState>("INITIAL");
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult>(
    SubmissionResult.UNKNOWN
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const answers = useRef<Answer[]>([]);

  const [questionItr, setQuestionItr] =
    useState<ArrayIterator<[number, Question]>>();
  const [question, setQuestion] = useState<[number, Question]>();

  async function startTest() {
    setError("");
    answers.current = [];
    try {
      const questions = await getNRandomQuestion(numberOfQuestions, testType);
      if (questions.length !== numberOfQuestions) {
        setError(
          `Expected ${numberOfQuestions} questions but got ${questions.length}`
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
      const correct = await submitAnswer(question[1].id, answer, testType);
      setSubmissionResult(
        correct === true ? SubmissionResult.CORRECT : SubmissionResult.INCORRECT
      );

      answers.current.push({
        question: question[1],
        answer,
        isCorrect: correct === true,
      });
    } catch (err) {
      console.error("Error submitting answer:", err);
      setSubmissionResult(SubmissionResult.UNKNOWN);
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
    setSubmissionResult(SubmissionResult.UNKNOWN);
  }

  function restartTest() {
    answers.current = [];
    setTestState("INITIAL");
    setAnswer("");
    setSubmissionResult(SubmissionResult.UNKNOWN);
    startTest();
  }

  function resetToInitial() {
    answers.current = [];
    setTestState("INITIAL");
    setAnswer("");
    setSubmissionResult(SubmissionResult.UNKNOWN);
  }

  // Calculate if passed based on current answers
  const correctCount = answers.current.filter((a) => a.isCorrect).length;
  const passed = correctCount >= passThreshold;

  return {
    testState,
    error,
    answer,
    submissionResult,
    isSubmitting,
    question,
    answers,
    numberOfQuestions,
    passThreshold,
    correctCount,
    passed,
    startTest,
    submit,
    nextQuestion,
    restartTest,
    resetToInitial,
    setAnswer,
  };
}
