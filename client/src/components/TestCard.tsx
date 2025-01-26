/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
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
import { Question, submitAnswer } from "../api";
import { useState } from "react";

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

interface TestCardProps {
  question: Question;
}

const TestCard = ({ question }: TestCardProps) => {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submissionResult, setSubmissionResult] = useState<
    "CORRECT" | "INCORRECT" | "UNKNOWN"
  >("UNKNOWN");

  const handleSubmission = async () => {
    setIsSubmitting(true);
    try {
      if (question) {
        switch (await submitAnswer(question?.id, answer)) {
          case true:
            setSubmissionResult("CORRECT");
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

  return (
    <>
      <Paper>Hello</Paper>
      <Card css={testContainer}>
        <Typography
          align="center"
          variant="h6"
        >{`${question?.id}. ${question?.question}`}</Typography>

        <div
          css={css({
            margin: 30,
            width: "100%",
          })}
        >
          <TextField
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmission();
              }
            }}
            autoComplete={"off"}
            css={css({
              width: "100%",
              // minWidth: 400,
            })}
            id="outlined-multiline-flexible"
            label="Answer"
            onChange={(e) => {
              setAnswer(e.target.value);
            }}
          />
          <div
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
              disabled={!answer}
              css={css({
                height: 40,
              })}
              variant="contained"
              onClick={handleSubmission}
            >
              Submit
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
          </div>

          {submissionResult !== "UNKNOWN" ? (
            <List
              css={css({
                marginTop: 30,
              })}
            >
              <Typography color="primary">Acceptable answers:</Typography>
              {question?.answers?.map((a, i) => {
                return <ListItem key={i}>{a}</ListItem>;
              })}
            </List>
          ) : null}
        </div>
      </Card>
    </>
  );
};

export default TestCard;
