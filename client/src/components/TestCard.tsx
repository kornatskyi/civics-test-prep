/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Alert,
  Box,
  Button,
  Card,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import { getNRandomQuestion, Question, submitAnswer } from "../api";
import { useRef, useState } from "react";

interface TestCardProps {}
const NUMBER_OF_QUESTIONS = 3;

interface TestResultProps {
  answers: Answer[];
  totalQuestion: number;
}

function TestResult({ answers, totalQuestion }: TestResultProps) {
  const totalCorrect = answers.reduce(
    (prev, curr) => prev + (curr.isCorrect ? 1 : 0),
    0
  );
  return (
    <Typography>
      Nice Work! You’ve completed the practice test and answered {totalCorrect}{" "}
      out of {totalQuestion} questions correctly. Keep practicing to improve
      your score and strengthen your knowledge of U.S. history, government, and
      civics. <br /> Want to try again? Click Try Again to restart with a new
      set of questions.
    </Typography>
  );
}

interface Answer {
  question: Question;
  answer: string;
  isCorrect: boolean;
}

function TestCard({}: TestCardProps) {
  const [questionItr, setQuestionItr] =
    useState<ArrayIterator<[number, Question]>>();
  const [question, setQuestion] = useState<[number, Question]>();
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const answers = useRef<Answer[]>([]);

  const [submissionResult, setSubmissionResult] = useState<
    "CORRECT" | "INCORRECT" | "UNKNOWN"
  >("UNKNOWN");

  const submit = async () => {
    setIsSubmitting(true);
    try {
      if (question) {
        let isCorrect = false;

        switch (await submitAnswer(question[1]?.id, answer)) {
          case true:
            setSubmissionResult("CORRECT");
            isCorrect = true;
            break;
          case false:
            setSubmissionResult("INCORRECT");
            break;
          default:
            setSubmissionResult("UNKNOWN");
            break;
        }
        answers.current.push({
          answer,
          isCorrect,
          question: question[1],
        });
      }
    } catch (error) {
      console.error("Error occurred while submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [testState, setTestState] = useState<
    "INITIAL" | "RUNNING" | "FINISHED"
  >("INITIAL");

  const startTest = async () => {
    const questions = await getNRandomQuestion(NUMBER_OF_QUESTIONS);

    if (questions.length != NUMBER_OF_QUESTIONS) {
      // Set error if the number of questions received is not equal to the expected number
      setError(
        "Expect " +
          NUMBER_OF_QUESTIONS +
          " questions but got " +
          questions.length
      );
    }

    const qItr = questions.entries();
    setQuestionItr(qItr);
    setQuestion(qItr.next().value);
    setTestState("RUNNING");
  };

  const nextQuestion = () => {
    const nextQuestion = questionItr?.next().value;
    if (!nextQuestion) {
      setTestState("FINISHED");
      return;
    }
    setQuestion(nextQuestion);
    setAnswer("");
    setSubmissionResult("UNKNOWN");
  };

  const restartTest = () => {
    setAnswer("");
    setSubmissionResult("UNKNOWN");
    setTestState("INITIAL");
    startTest();
    answers.current = [];
  };

  return error ? (
    <Alert
      variant="filled"
      severity="error"
      sx={{
        marginTop: 30,
        width: "100%",
        alignSelf: "center",
      }}
    >
      {error}
    </Alert>
  ) : (
    <Card
      
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignSelf: "center",
        backdropFilter: "blur(2px)",
        padding: "30px",
        mt: 10
      }}
    >
      {(() => {
        switch (testState) {
          case "INITIAL":
            return (
              <>
                <Typography color="primary" sx={{ textAlign: "center" }}>
                  Ready to Test Your Knowledge? <br />
                  <br />
                  You will receive a set of randomized questions similar to
                  those on the official U.S. Naturalization civics test. Answer
                  carefully, and remember that practice makes perfect!
                  <br />
                  <br />
                  Click Start Test to begin.
                </Typography>

                <Button
                  variant="contained"
                  sx={{ marginTop: 30 }}
                  onClick={startTest}
                >
                  Start Test
                </Button>
              </>
            );
          case "RUNNING":
            return (
              <>
                {" "}
                <Box
                  sx={{
                    alignSelf: "end",
                  }}
                >
                  {question?.[0] !== undefined &&
                    `Question ${
                      question?.[0] + 1
                    } out of ${NUMBER_OF_QUESTIONS}`}
                </Box>
                <Typography
                  align="center"
                  variant="h6"
                  mt={2}
                >{`${question?.[1].id}. ${question?.[1].question}`}</Typography>
                <Box
                  mt={4}
                  sx={{
                    width: "100%",
                  }}
                >
                  <TextField
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (submissionResult === "UNKNOWN"
                          ? submit
                          : nextQuestion)();
                      }
                    }}
                    autoComplete={"off"}
                    sx={{
                      width: "100%",
                    }}
                    id="outlined-multiline-flexible"
                    label="Answer"
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                    }}
                    placeholder="Type your answer here"
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 30,
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      loading={isSubmitting}
                      disabled={!answer && submissionResult === "UNKNOWN"}
                      sx={{
                        height: 40,
                      }}
                      variant="contained"
                      onClick={
                        submissionResult === "UNKNOWN" ? submit : nextQuestion
                      }
                    >
                      {submissionResult === "UNKNOWN"
                        ? "Submit"
                        : "Next question"}
                    </Button>

                    {submissionResult === "CORRECT" ? (
                      <Typography color="success" display={"flex"}>
                        <CheckIcon /> Correct answer
                      </Typography>
                    ) : submissionResult === "INCORRECT" ? (
                      <Typography color="error" display={"flex"}>
                        <ClearIcon />
                        Incorrect answer
                      </Typography>
                    ) : (
                      ""
                    )}
                  </Box>
                  {submissionResult !== "UNKNOWN" ? (
                    <List
                      sx={{
                        marginTop: 30,
                      }}
                    >
                      <Typography color="primary">
                        Acceptable answers:
                      </Typography>
                      {question?.[1].answers?.map((a, i) => {
                        return <ListItem key={i}>{a}</ListItem>;
                      })}
                    </List>
                  ) : null}
                </Box>
              </>
            );
          case "FINISHED":
            return (
              <>
                <TestResult
                  answers={answers.current}
                  totalQuestion={NUMBER_OF_QUESTIONS}
                />

                <Button
                  variant="contained"
                  sx={{ marginTop: 30 }}
                  onClick={restartTest}
                >
                  Try again
                </Button>
              </>
            );
          default:
            return <></>;
        }
      })()}
    </Card>
  );
}

export default TestCard;
