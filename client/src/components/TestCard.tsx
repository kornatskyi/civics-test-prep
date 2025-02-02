/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  List,
  ListItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import { Question } from "../api";
import { useTest } from "./useTest.ts";
import InfoIcon from "@mui/icons-material/Info";
import theme from "../theme.tsx";

const NUMBER_OF_QUESTIONS = 3;

interface Answer {
  question: Question;
  answer: string;
  isCorrect: boolean;
}

interface TestResultProps {
  answers: Answer[];
  numberOfQuestions: number;
}

function TestResult({ answers, numberOfQuestions }: TestResultProps) {
  const totalCorrect = answers.reduce(
    (prev, curr) => prev + (curr.isCorrect ? 1 : 0),
    0
  );
  return (
    <Typography>
      {`Nice Work! You’ve completed the practice test and answered ${totalCorrect} out of ${numberOfQuestions} questions correctly. Keep practicing to improve your score and strengthen your knowledge of U.S. history, government, and civics.`}
      <br />
      {`Want to try again? Click Try Again to restart with a new set of questions.`}
    </Typography>
  );
}

function TestCard() {
  const {
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
  } = useTest(NUMBER_OF_QUESTIONS);

  return error ? (
    <Alert
      variant="filled"
      severity="error"
      sx={{
        mt: 4,
        width: "100%",
        alignSelf: "center",
        borderRadius: theme.shape.borderRadius,
      }}
    >
      {error}
    </Alert>
  ) : (
    <Container
      sx={{
        backgroundColor: theme.palette.background.default,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignSelf: "center",
        backdropFilter: "blur(2px)",
        padding: "30px",
        mt: 10,
        borderRadius: theme.shape.borderRadius,
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
                <Button variant="contained" sx={{ mt: 2 }} onClick={startTest}>
                  Start Test
                </Button>
              </>
            );
          case "RUNNING":
            return (
              <>
                <Box sx={{ alignSelf: "end" }}>
                  {question?.[0] !== undefined &&
                    `Question ${question[0] + 1} out of ${NUMBER_OF_QUESTIONS}`}
                </Box>
                <Typography align="center" variant="h6" mt={2}>
                  {question && `${question[1].id}. ${question[1].question}`}
                </Typography>
                <Box mt={4} sx={{ width: "100%" }}>
                  <TextField
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (submissionResult === "UNKNOWN") {
                          submit();
                        } else {
                          nextQuestion();
                        }
                      }
                    }}
                    autoComplete="off"
                    sx={{ width: "100%" }}
                    label="Answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here"
                    disabled={submissionResult !== "UNKNOWN"}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      mt: 4,
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      loading={isSubmitting}
                      disabled={!answer && submissionResult === "UNKNOWN"}
                      sx={{ height: 40, width: 100 }}
                      variant="contained"
                      onClick={
                        submissionResult === "UNKNOWN" ? submit : nextQuestion
                      }
                    >
                      {submissionResult === "UNKNOWN" ? "Submit" : "Next"}
                    </Button>

                    <Box>
                      {submissionResult === "CORRECT" ? (
                        <Typography
                          sx={{
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          color="success"
                          display="flex"
                        >
                          <CheckIcon
                            style={{
                              color: theme.palette.success.main,
                            }}
                          />{" "}
                          Correct answer
                        </Typography>
                      ) : submissionResult === "INCORRECT" ? (
                        <Typography
                          sx={{
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          color="error"
                          display="flex"
                        >
                          <ClearIcon
                            style={{
                              color: theme.palette.error.main,
                            }}
                          />
                          Incorrect answer
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      mt: 2,
                      maxHeight: 300,
                      overflowY: "auto",
                    }}
                  >
                    {submissionResult !== "UNKNOWN" && question && (
                      <>
                        <Box>
                          <Typography color="primary">Your answer:</Typography>
                          &nbsp;
                          <Typography>{answer}</Typography>
                        </Box>

                        <List>
                          <Typography color="primary">
                            Acceptable answers:
                          </Typography>
                          {question[1].answers?.map((a, i) => (
                            <ListItem key={i}>{a}</ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </Box>
                </Box>
              </>
            );
          case "FINISHED":
            return (
              <>
                <TestResult
                  answers={answers.current}
                  numberOfQuestions={NUMBER_OF_QUESTIONS}
                />
                <Button
                  variant="contained"
                  sx={{ mt: 4 }}
                  onClick={restartTest}
                >
                  Try again
                </Button>
              </>
            );
          default:
            return null;
        }
      })()}
      <Tooltip
        slotProps={{
          tooltip: {
            sx: {
              backgroundColor: "white",
              color: theme.palette.primary.main,
            },
          },
        }}
        title={
          <Typography variant="body2">
            Some questions, such as those about current government officials,
            are <strong>not included</strong> in this practice test because they
            change over time.
            <br />
            <br />
            Visit the
            <Link
              href="https://www.uscis.gov/citizenship"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
              {" USCIS Citizenship Test page "}
            </Link>
            for the latest information.
          </Typography>
        }
        arrow
      >
        <InfoIcon
          sx={{ alignSelf: "end", cursor: "pointer", color: "primary.main" }}
        />
      </Tooltip>
    </Container>
  );
}

export default TestCard;
