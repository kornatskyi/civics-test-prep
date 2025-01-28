/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  css,
  List,
  ListItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import {
  getNRandomQuestion,
  getRandomQuestion,
  Question,
  submitAnswer,
} from "../api";
import { useEffect, useState } from "react";

const testContainer = css({
  width: "100%",
  maxWidth: 800,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  alignSelf: "center",
  // backgroundColor: white_semi_transparent, // Semi-transparent background
  backdropFilter: "blur(2px)", // Apply blur effect,
  padding: "30px",
  marginTop: "10vh",
});

interface TestCardProps {}
const NUMBER_OF_QUESTIONS = 10;

const TestCard = ({}: TestCardProps) => {
  const [questionItr, setQuestionItr] =
    useState<ArrayIterator<[number, Question]>>();
  const [question, setQuestion] = useState<[number, Question]>();
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submissionResult, setSubmissionResult] = useState<
    "CORRECT" | "INCORRECT" | "UNKNOWN"
  >("UNKNOWN");

  const handleSubmission = async () => {
    setIsSubmitting(true);
    try {
      if (question) {
        switch (await submitAnswer(question[1]?.id, answer)) {
          case true:
            setSubmissionResult("CORRECT");
            setScore((prev) => prev + 1);
            break;
          case false:
            setSubmissionResult("INCORRECT");
            break;
          default:
            setSubmissionResult("UNKNOWN");
            break;
        }
      }
    } catch {
      console.log("Error occurred while submitting answer!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isTestStarted, setIsTestStarted] = useState(false);

  const startTestHandler = async () => {
    const questions = await getNRandomQuestion(NUMBER_OF_QUESTIONS);

    if (questions.length != NUMBER_OF_QUESTIONS) {
      setError("Expect 10 questions but got " + NUMBER_OF_QUESTIONS);
    }

    const qItr = questions.entries();
    setQuestionItr(qItr);
    setQuestion(qItr.next().value);

    setIsTestStarted(true);
  };

  const nextQuestionHandler = () => {
    setQuestion(questionItr?.next().value);
    setAnswer("");
    setSubmissionResult("UNKNOWN");
  };

  return error ? (
    <Alert
      variant="filled"
      severity="error"
      css={css({
        marginTop: 30,
        maxWidth: 800,
        width: "100%",
        alignSelf: "center",
      })}
    >
      {error}
    </Alert>
  ) : (
    <Card css={testContainer}>
      {isTestStarted ? (
        <>
          <Box
            css={css({
              alignSelf: "end",
            })}
          >
            {question?.[0]} / {NUMBER_OF_QUESTIONS}
          </Box>
          <Typography
            align="center"
            variant="h6"
            mt={2}
          >{`${question?.[1].id}. ${question?.[1].question}`}</Typography>
          <Box
            mt={4}
            css={css({
              width: "100%",
            })}
          >
            <TextField
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (submissionResult === "UNKNOWN"
                    ? handleSubmission
                    : nextQuestionHandler)();
                }
              }}
              autoComplete={"off"}
              css={css({
                width: "100%",
              })}
              id="outlined-multiline-flexible"
              label="Answer"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
              }}
            />
            <Box
              css={css({
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginTop: 30,
                justifyContent: "space-between",
              })}
            >
              <Button
                loading={isSubmitting}
                disabled={!answer && submissionResult === "UNKNOWN"}
                css={css({
                  height: 40,
                })}
                variant="contained"
                onClick={
                  submissionResult === "UNKNOWN"
                    ? handleSubmission
                    : nextQuestionHandler
                }
              >
                {submissionResult === "UNKNOWN" ? "Submit" : "Next question"}
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
                css={css({
                  marginTop: 30,
                })}
              >
                <Typography color="primary">Acceptable answers:</Typography>
                {question?.[1].answers?.map((a, i) => {
                  return <ListItem key={i}>{a}</ListItem>;
                })}
              </List>
            ) : null}{" "}
          </Box>
        </>
      ) : (
        <>
          <Typography color="primary">
            You need to answer at least 10 questions
          </Typography>

          <Button
            variant="contained"
            css={css({ marginTop: 30 })}
            onClick={startTestHandler}
          >
            Start Test
          </Button>
        </>
      )}
    </Card>
  );
};

export default TestCard;
