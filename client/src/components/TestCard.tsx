import {
  Box,
  Button,
  Container,
  List,
  ListItem,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import { Question } from "../api";
import { SubmissionResult, useTest } from "./useTest.ts";
import theme from "../theme.tsx";
import ErrorAlert from "./ErrorAlert.tsx";
import TestInfo from "./TestInfo.tsx";
import { useState } from "react";

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

interface InitialStageProps {
  startTest: () => Promise<void>;
}

function InitialStage({ startTest }: InitialStageProps) {
  return (
    <>
      <Typography
        color="primary"
        sx={{ textAlign: "center", mt: { xs: 2, sm: 2, md: 2, lg: 4, xl: 4 } }}
      >
        Ready to Test Your Knowledge? <br />
        Click Start Test to begin.
      </Typography>
      <Button
        variant="contained"
        sx={{ mt: { xs: 2, sm: 2, md: 2, lg: 4, xl: 4 } }}
        onClick={startTest}
      >
        Start Test
      </Button>
    </>
  );
}

interface RunningStageProps {
  answer: string;
  submissionResult: SubmissionResult;
  isSubmitting: boolean;
  question: [number, Question] | undefined;
  submit: () => Promise<void>;
  nextQuestion: () => void;
  setAnswer: React.Dispatch<React.SetStateAction<string>>;
}

function RunningStage({
  answer,
  submissionResult,
  isSubmitting,
  question,
  submit,
  nextQuestion,
  setAnswer,
}: RunningStageProps) {
  return (
    <>
      <Box sx={{ alignSelf: "end" }}>
        <Typography variant="body2" color="textSecondary">
          {question?.[0] !== undefined &&
            `Question ${question[0] + 1} out of ${NUMBER_OF_QUESTIONS}`}
        </Typography>
      </Box>
      <Typography align="center" variant="h6" mt={2}>
        {question && `${question[1].id}. ${question[1].question}`}
      </Typography>
      <Box sx={{ width: "100%", mt: { xs: 4, sm: 4, md: 4, lg: 6, xl: 6 } }}>
        <TextField
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (submissionResult === SubmissionResult.UNKNOWN) {
                submit();
              } else {
                nextQuestion();
              }
            }
          }}
          autoComplete="off"
          sx={{ width: "100%" }}
          size={
            useMediaQuery(theme.breakpoints.down("md")) ? "small" : "medium"
          }
          label="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here"
          disabled={submissionResult !== SubmissionResult.UNKNOWN}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            mt: { xs: 2, sm: 2, md: 2, lg: 4, xl: 4 },
            justifyContent: "space-between",
          }}
        >
          <Button
            loading={isSubmitting}
            disabled={!answer && submissionResult === SubmissionResult.UNKNOWN}
            sx={{ height: 40, width: 100 }}
            variant="contained"
            size={
              useMediaQuery(theme.breakpoints.down("md")) ? "small" : "medium"
            }
            onClick={
              submissionResult === SubmissionResult.UNKNOWN
                ? submit
                : nextQuestion
            }
          >
            {submissionResult === SubmissionResult.UNKNOWN ? "Submit" : "Next"}
          </Button>

          <Box>
            {submissionResult === SubmissionResult.CORRECT ? (
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
                />
                Correct answer
              </Typography>
            ) : submissionResult === SubmissionResult.INCORRECT ? (
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
          {submissionResult !== SubmissionResult.UNKNOWN && question && (
            <>
              <Typography display={"inline"} color="primary">
                Your answer:
              </Typography>
              &nbsp;
              <Typography display={"inline"}>{answer}</Typography>
              <List>
                <Typography color="primary">Acceptable answers:</Typography>
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
}

interface FinishedStageProps {
  answers: React.MutableRefObject<Answer[]>;
  restartTest: () => void;
}

function FinishedStage({ answers, restartTest }: FinishedStageProps) {
  const [showResults, setShowResults] = useState(false);

  return (
    <>
      <TestResult
        answers={answers.current}
        numberOfQuestions={NUMBER_OF_QUESTIONS}
      />
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" sx={{ mt: 4 }} onClick={restartTest}>
          Try again
        </Button>
        <Button
          variant="outlined"
          sx={{ mt: 4 }}
          onClick={() => setShowResults((prev) => !prev)}
        >
          See results
        </Button>
      </Box>
      <Box
        sx={{
          width: "100%",
          maxHeight: 300,
          overflow: "auto",
          mt: 4,
        }}
      >
        {showResults ? (
          <>
            {answers.current.map((a, i) => (
              <>
                <Box key={i} sx={{ width: "100%" }}>
                  <Typography
                    color="primary"
                    variant="body2"
                  >{`${a.question.id}. ${a.question.question}`}</Typography>
                  <Box sx={{ ml: 2 }}>
                    <Box sx={{ display: "flex", flexDirection: "row", mt: 1 }}>
                      <Typography variant="body2" color="primary">
                        Your answer:
                      </Typography>
                      &nbsp;
                      <Typography
                        variant="body2"
                        color={a.isCorrect ? "success" : "error"}
                      >
                        {a.answer}
                      </Typography>
                    </Box>
                    <List>
                      <Typography variant="body2" color="primary">
                        Acceptable answers:
                      </Typography>
                      {a.question.answers?.map((a, i) => (
                        <ListItem key={i}>
                          <Typography variant="body2">{a}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              </>
            ))}
          </>
        ) : null}
      </Box>
    </>
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
    <ErrorAlert error={error} />
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
        mt: { xs: 5, sm: 8, md: 10, lg: 12, xl: 15 }, // Responsive margin-top
        borderRadius: theme.shape.borderRadius,
        mb: { xs: 5, sm: 8, md: 10, lg: 12, xl: 15 }, // Responsive margin-top
      }}
    >
      {(() => {
        switch (testState) {
          case "INITIAL":
            return <InitialStage startTest={startTest} />;
          case "RUNNING":
            return (
              <RunningStage
                answer={answer}
                submissionResult={submissionResult}
                isSubmitting={isSubmitting}
                question={question}
                submit={submit}
                nextQuestion={nextQuestion}
                setAnswer={setAnswer}
              />
            );
          case "FINISHED":
            return (
              <FinishedStage answers={answers} restartTest={restartTest} />
            );
          default:
            return null;
        }
      })()}
      <TestInfo />
    </Container>
  );
}

export default TestCard;
