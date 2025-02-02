import {
  Box,
  Button,
  Container,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import { Question } from "../api";
import { SubmissionResult, useTest } from "./useTest.ts";
import theme from "../theme.tsx";
import ErrorAlert from "./ErrorAlert.tsx";
import TestInfo from "./TestInfo.tsx";

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
      <Typography color="primary" sx={{ textAlign: "center" }}>
        Ready to Test Your Knowledge? <br />
        Click Start Test to begin.
      </Typography>
      <Button variant="contained" sx={{ mt: 2 }} onClick={startTest}>
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
              if (submissionResult === SubmissionResult.UNKNOWN) {
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
          disabled={submissionResult !== SubmissionResult.UNKNOWN}
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
            disabled={!answer && submissionResult === SubmissionResult.UNKNOWN}
            sx={{ height: 40, width: 100 }}
            variant="contained"
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
                />{" "}
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
              <Box>
                <Typography color="primary">Your answer:</Typography>
                &nbsp;
                <Typography>{answer}</Typography>
              </Box>

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
  return (
    <>
      <TestResult
        answers={answers.current}
        numberOfQuestions={NUMBER_OF_QUESTIONS}
      />
      <Button variant="contained" sx={{ mt: 4 }} onClick={restartTest}>
        Try again
      </Button>
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
