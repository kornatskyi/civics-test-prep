import { Box, Link, Typography, useTheme } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useState } from "react";
import { TestType } from "../api";

interface TestInfoProps {
  testType: TestType;
}

export default function TestInfo({ testType }: TestInfoProps) {
  const [showInfo, setShowInfo] = useState(false);
  const theme = useTheme();

  const is2025Test = testType === "2025";

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "start",
          cursor: "pointer",
          ":hover": { textDecoration: "underline" },
          mt: { xs: 2, sm: 2, md: 2, lg: 4, xl: 4 },
        }}
      >
        <Typography
          onClick={() => {
            setShowInfo((prev) => !prev);
          }}
          variant="body2"
          color="textSecondary"
        >
          Learn about the test
        </Typography>
        &nbsp;
        <InfoIcon
          fontSize="inherit"
          sx={{ color: theme.palette.text.secondary }}
        />
      </Box>
      {showInfo ? (
        <Box
          sx={{
            maxHeight: 350,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1, sm: 1, md: 2, lg: 2, xl: 2 },
            p: { xs: 1, sm: 1, md: 2, lg: 2, xl: 2 },
          }}
        >
          <Typography variant="body2" fontWeight="bold" color="primary">
            {is2025Test ? "2025 Civics Test (128 Questions)" : "2008 Civics Test (100 Questions)"}
          </Typography>
          
          <Typography variant="body2">
            {is2025Test ? (
              <>
                This is the <strong>2025 version</strong> of the civics test, which includes 128 questions. 
                You will be asked 20 questions and must answer at least 12 correctly to pass.
                This test is for applicants who filed Form N-400 <strong>on or after October 20, 2025</strong>.
              </>
            ) : (
              <>
                This is the <strong>2008 version</strong> of the civics test, which includes 100 questions.
                You will be asked 10 questions and must answer at least 6 correctly to pass.
                This test is for applicants who filed Form N-400 <strong>before October 20, 2025</strong>.
              </>
            )}
          </Typography>

          <Typography variant="body2">
            The answers are evaluated by a Large Language Model (LLM), so they
            don't need to be exact matches. The LLM assesses the answers with
            high precision, similar to a real-world test.
          </Typography>

          <Typography variant="body2">
            <strong>65/20 Special Consideration:</strong> If you are 65 years old or older and have 
            been a U.S. permanent resident for 20+ years, you may study a smaller subset of questions 
            and take the test in your native language.
          </Typography>

          <Typography variant="body2">
            For official information, visit the{" "}
            <Link
              href="https://www.uscis.gov/citizenship/learn-about-citizenship/the-naturalization-interview-and-test"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
              USCIS website
            </Link>
            . If you encounter any issues or want to learn more about this project, please visit the{" "}
            <Link
              href="https://github.com/kornatskyi/civics-test-prep/"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
              GitHub repository
            </Link>
            .
          </Typography>
        </Box>
      ) : null}
    </>
  );
}
