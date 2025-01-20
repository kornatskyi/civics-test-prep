import { useEffect, useState } from "react";
import { getRandomQuestion, Question, submitAnswer } from "./api";
import { Button, css } from "@mui/material";

const testContainer = css({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
})

function App() {
  const [question, setQuestion] = useState<Question>();
  const [answer, setAnswer] = useState("")



  useEffect(() => {
    async function startFetching() {
      const result = await getRandomQuestion();
      if (!ignore) {
        setQuestion({ id: result.id, question: result.question });
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
  };

  return (
    <>
      <div css={testContainer}>
        <h1>US naturalization test</h1>
        <h2>Civics Test</h2>
        <p>{question?.question}</p>
        <input value={answer} placeholder="Input your answer here" onChange={(e) => {
          setAnswer(e.target.value)
        }} />
        <br />
        <Button variant="contained" onClick={handleSubmission}>Submit</Button>
        {submissionResult === "CORRECT" ? "Correct answer" : submissionResult === "INCORRECT" ? "Incorrect answer" : ""}
      </div>
    </>
  );
}

export default App;
