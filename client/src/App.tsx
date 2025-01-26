/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { getRandomQuestion, Question } from "./api";
import { Box, css, Link, Typography, useTheme } from "@mui/material";
import background from "./assets/charles-duck-unitas-hPq1nLfLgBY-unsplash.jpg";
import TestCard from "./components/TestCard";

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

  return (
    <div css={appContainer}>
      <Box
        component={"header"}
        sx={{
          // backgroundColor: white_semi_transparent,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: theme.palette.primary.dark,
        }}
      >
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
      </Box>
      {question && <TestCard question={question} />}

      <Box
        component="footer"
        sx={{
          mt: "auto",
          py: 2,
          backgroundColor: "rgba(0,0,0,0.2)",
          textAlign: "center",
          color: "rgb(209, 209, 209)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" css={css({ maxWidth: 800 })}>
          This application is not an official test, just a preparation tool.
        </Typography>
        <Typography variant="body2" css={css({ maxWidth: 800 })}>
          Please refer to the official U.S. government website for the latest
          and most accurate information on the U.S. Naturalization test.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }} css={css({ maxWidth: 800 })}>
          <Link
            href="https://www.uscis.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Official USCIS Website
          </Link>
        </Typography>
      </Box>
    </div>
  );
}

export default App;
