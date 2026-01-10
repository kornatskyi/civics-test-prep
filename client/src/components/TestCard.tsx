import {
  Box,
  Button,
  CircularProgress,
  Container,
  List,
  ListItem,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Question, TestConfig } from "../api";
import { SubmissionResult, TestSettings, useTest } from "./useTest";
import theme from "../theme";
import ErrorAlert from "./ErrorAlert";
import TestInfo from "./TestInfo";
import { useState, useCallback, useEffect } from "react";

interface Answer {
  question: Question;
  answer: string;
  isCorrect: boolean;
}

interface TestResultProps {
  answers: Answer[];
  numberOfQuestions: number;
  passThreshold: number;
}

const TestResult: React.FC<TestResultProps> = ({
  answers,
  numberOfQuestions,
  passThreshold,
}) => {
  const totalCorrect = answers.reduce(
    (prev, curr) => prev + (curr.isCorrect ? 1 : 0),
    0
  );
  const passed = totalCorrect >= passThreshold;

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
        color={passed ? "success.main" : "error.main"}
      >
        {passed ? "🎉 PASSED!" : "FAILED"}
      </Typography>
      <Typography
        variant="h5"
        gutterBottom
        color={passed ? "success.main" : "error.main"}
      >
        Score: {totalCorrect}/{numberOfQuestions}
      </Typography>
      {!passed && (
        <Typography
          variant="body1"
          sx={{ mt: 1 }}
          color="text.secondary"
        >
          You needed {passThreshold} correct to pass
        </Typography>
      )}
      <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
        Ready for another round?
        <br />
        Click Try Again for new questions.
      </Typography>
    </Box>
  );
};

interface LoadingStageProps {
  config: TestConfig;
}

const LoadingStage: React.FC<LoadingStageProps> = ({ config }) => {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}
    >
      <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
        {config.testType === "2008" ? "2008 Civics Test" : "2025 Civics Test"}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
        {config.questionsAsked} questions • {config.passThreshold} correct to pass
      </Typography>
      <CircularProgress sx={{ color: theme.palette.primary.main }} />
      <Typography sx={{ mt: 2 }} color="text.secondary">
        Loading questions...
      </Typography>
    </Box>
  );
};

interface RunningStageProps {
  answer: string;
  submissionResult: SubmissionResult;
  isSubmitting: boolean;
  question: [number, Question] | undefined;
  numberOfQuestions: number;
  submit: () => Promise<void>;
  nextQuestion: () => void;
  setAnswer: React.Dispatch<React.SetStateAction<string>>;
}

const AnswerFeedback: React.FC<{ submissionResult: SubmissionResult }> = ({
  submissionResult,
}) => {
  switch (submissionResult) {
    case SubmissionResult.CORRECT:
      return (
        <Typography
          sx={{
            justifyContent: "center",
            alignItems: "center",
          }}
          color="success"
          display="flex"
        >
          <CheckIcon style={{ color: theme.palette.success.main }} />
          Correct answer
        </Typography>
      );
    case SubmissionResult.INCORRECT:
      return (
        <Typography
          sx={{
            justifyContent: "center",
            alignItems: "center",
          }}
          color="error"
          display="flex"
        >
          <ClearIcon style={{ color: theme.palette.error.main }} />
          Incorrect answer
        </Typography>
      );
    default:
      return null;
  }
};

const AnswerDetails: React.FC<{
  submissionResult: SubmissionResult;
  question: [number, Question] | undefined;
  answer: string;
}> = ({ submissionResult, question, answer }) => {
  if (submissionResult === SubmissionResult.UNKNOWN || !question) {
    return null;
  }

  return (
    <Box
      sx={{
        mt: 2,
        maxHeight: 300,
        overflowY: "auto",
      }}
    >
      <>
        <Typography display={"inline"} color="primary">
          Your answer:
        </Typography>
         <Typography display={"inline"}>{answer}</Typography>
        <List>
          <Typography color="primary">Acceptable answers:</Typography>
          {question[1].answers?.map((a, i) => (
            <ListItem key={i}>
              <Typography
                sx={{
                  whiteSpace: "break-spaces",
                }}
              >
                {a}
              </Typography>
            </ListItem>
          ))}
        </List>
      </>
    </Box>
  );
};

const RunningStage: React.FC<RunningStageProps> = ({
  answer,
  submissionResult,
  isSubmitting,
  question,
  numberOfQuestions,
  submit,
  nextQuestion,
  setAnswer,
}) => {
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));
  const inputSize = isMdDown ? "small" : "medium";

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (submissionResult === SubmissionResult.UNKNOWN) {
          submit();
        } else {
          nextQuestion();
        }
      }
    },
    [submissionResult, submit, nextQuestion]
  );

  const handleSubmitOrNext = useCallback(() => {
    if (submissionResult === SubmissionResult.UNKNOWN) {
      submit();
    } else {
      nextQuestion();
    }
  }, [submissionResult, submit, nextQuestion]);

  const buttonText =
    submissionResult === SubmissionResult.UNKNOWN ? "Submit" : "Next";

  return (
    <>
      <Box sx={{ alignSelf: "end" }}>
        <Typography variant="body2" color="textSecondary">
          {question?.[0] !== undefined &&
            `Question ${question[0] + 1} out of ${numberOfQuestions}`}
        </Typography>
      </Box>
      <Typography align="center" variant="h6" mt={2}>
        {question && `${question[1].id}. ${question[1].question}`}
      </Typography>
      <Box
        sx={{
          width: "100%",
          mt: { xs: 4, sm: 4, md: 4, lg: 6, xl: 6 },
          outline: "none",
        }}
      >
        <TextField
          autoFocus={true}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          sx={{ width: "100%" }}
          size={inputSize}
          label="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here"
          slotProps={{
            input: {
              readOnly: submissionResult !== SubmissionResult.UNKNOWN,
            },
          }}
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
            size={inputSize}
            onClick={handleSubmitOrNext}
          >
            {buttonText}
          </Button>

          <AnswerFeedback submissionResult={submissionResult} />
        </Box>
        <AnswerDetails
          submissionResult={submissionResult}
          question={question}
          answer={answer}
        />
      </Box>
    </>
  );
};

interface FinishedStageProps {
  answers: React.MutableRefObject<Answer[]>;
  numberOfQuestions: number;
  passThreshold: number;
  restartTest: () => void;
  onChangeTest: () => void;
}

const QuestionResult: React.FC<{ answerData: Answer }> = ({ answerData }) => (
  <Box sx={{ width: "100%", mb: 2 }}>
    <Typography color="primary" variant="body2">
      {`${answerData.question.id}. ${answerData.question.question}`}
    </Typography>
    <Box sx={{ ml: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "row", mt: 1 }}>
        <Typography variant="body2" color="primary">
          Your answer:
        </Typography>
         
        <Typography
          variant="body2"
          color={answerData.isCorrect ? "success" : "error"}
        >
          {answerData.answer}
        </Typography>
      </Box>
      <List>
        <Typography variant="body2" color="primary">
          Acceptable answers:
        </Typography>
        {answerData.question.answers?.map((ans, i) => (
          <ListItem key={i}>
            <Typography variant="body2">{ans}</Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  </Box>
);

const FinishedStage: React.FC<FinishedStageProps> = ({
  answers,
  numberOfQuestions,
  passThreshold,
  restartTest,
  onChangeTest,
}) => {
  const [showResults, setShowResults] = useState(false);

  const toggleResults = useCallback(() => {
    setShowResults((prev) => !prev);
  }, []);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <TestResult
        answers={answers.current}
        numberOfQuestions={numberOfQuestions}
        passThreshold={passThreshold}
      />
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 2,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Button variant="contained" onClick={restartTest}>
          Try again
        </Button>
        <Button variant="outlined" onClick={toggleResults}>
          {showResults ? "Hide results" : "See results"}
        </Button>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={onChangeTest}
        >
          Change Test
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
        {showResults && (
          <>
            {answers.current.map((answerData, index) => (
              <QuestionResult key={index} answerData={answerData} />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

interface TestCardProps {
  config: TestConfig;
  onChangeTest: () => void;
}

const TestCard: React.FC<TestCardProps> = ({ config, onChangeTest }) => {
  const settings: TestSettings = {
    testType: config.testType,
    numberOfQuestions: config.questionsAsked,
    passThreshold: config.passThreshold,
  };

  const {
    testState,
    error,
    answer,
    submissionResult,
    isSubmitting,
    question,
    answers,
    numberOfQuestions,
    passThreshold,
    startTest,
    submit,
    nextQuestion,
    restartTest,
    setAnswer,
  } = useTest(settings);

  // Auto-start test when component mounts
  useEffect(() => {
    if (testState === "INITIAL") {
      startTest();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderStage = useCallback(() => {
    switch (testState) {
      case "INITIAL":
        return <LoadingStage config={config} />;
      case "RUNNING":
        return (
          <RunningStage
            answer={answer}
            submissionResult={submissionResult}
            isSubmitting={isSubmitting}
            question={question}
            numberOfQuestions={numberOfQuestions}
            submit={submit}
            nextQuestion={nextQuestion}
            setAnswer={setAnswer}
          />
        );
      case "FINISHED":
        return (
          <FinishedStage
            answers={answers}
            numberOfQuestions={numberOfQuestions}
            passThreshold={passThreshold}
            restartTest={restartTest}
            onChangeTest={onChangeTest}
          />
        );
      default:
        return null;
    }
  }, [
    testState,
    config,
    answer,
    submissionResult,
    isSubmitting,
    question,
    numberOfQuestions,
    passThreshold,
    submit,
    nextQuestion,
    answers,
    restartTest,
    onChangeTest,
    setAnswer,
  ]);

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
        mt: { xs: 5, sm: 8, md: 10, lg: 12, xl: 15 },
        borderRadius: theme.shape.borderRadius,
        mb: { xs: 5, sm: 8, md: 10, lg: 12, xl: 15 },
      }}
    >
      {testState === "RUNNING" && (
        <Button
          variant="text"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={onChangeTest}
          sx={{ alignSelf: "flex-start", mb: 1 }}
        >
          Change Test
        </Button>
      )}
      {renderStage()}
      <TestInfo testType={config.testType} />
    </Container>
  );
};

export default TestCard;
