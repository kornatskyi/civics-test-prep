/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { getRandomQuestion, Question, submitAnswer } from "./api";
import {
  Button,
  Card,
  css,
  List,
  ListItem,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import background from "./assets/tim-mossholder-3Xl3lI5gjqg-unsplash.jpg";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";

const american_blue = "rgba(10, 49, 97, 1.0)";
const american_blue_semi_transparent = "rgba(10, 49, 97, 0.2)";
const white_semi_transparent = "rgba(255,255,255, 0.5)";
const american_red = "rgb(191,10,48, 1.0)";

const testContainer = css({
  width: "100%",
  maxWidth: 700,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  alignSelf: "center",
  backgroundColor: white_semi_transparent, // Semi-transparent background
  backdropFilter: "blur(2px)", // Apply blur effect,
  padding: "30px",
  marginTop: "10vh",
});

const appContainer = css({
  backgroundImage: `url(${background})`, // Use the correct syntax
  backgroundSize: "cover", // Optional: Ensure the image covers the container
  backgroundRepeat: "no-repeat", // Optional: Avoid repeating the image
  backgroundPosition: "center", // Optional: Center the image
  width: "100%", // Ensure the container has proper dimensions
  height: "100vh", // Set height to viewport height
  display: "flex",
  flexDirection: "column",
  padding: 50,
});

function App() {
  const [question, setQuestion] = useState<Question>();
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    async function startFetching() {
      const result = await getRandomQuestion();
      if (!ignore) {
        setQuestion({
          id: result.id,
          question: result.question,
          answers: result.answers,
        });
      }
    }

    let ignore = false;
    startFetching();
    return () => {
      ignore = true;
    };
  }, []);

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
    <div css={appContainer}>
      <Card css={testContainer}>
        <Typography
          align="center"
          color="primary"
          css={css({
            alignSelf: "center",
            margin: 30,
            marginBottom: 60,
          })}
          variant="h4"
        >
          U.S. NATURALIZATION TEST PRACTICE
        </Typography>
        <Typography
          align="center"
          variant="h6"
        >{`${question?.id}. ${question?.question}`}</Typography>

        <div
          css={css({
            margin: 30,
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
              minWidth: 400,
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
    </div>
  );
}

export default App;
