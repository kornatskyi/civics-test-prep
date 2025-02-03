import { Box, Link, Typography, useTheme } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useState } from "react";

export default function TestInfo() {
  const [showInfo, setShowInfo] = useState(false);
  const theme = useTheme();
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
            maxHeight: 300,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1, sm: 1, md: 2, lg: 2, xl: 2 },
            p: { xs: 1, sm: 1, md: 2, lg: 2, xl: 2 },
          }}
        >
          <Typography variant="body2">
            The test consists of 10 random questions from the list of 100
            questions asked during the interview.
          </Typography>

          <Typography variant="body2">
            Some questions, such as those about current government officials,
            are <strong>not included</strong> in this practice test because they
            change over time. Visit the{" "}
            <Link
              href="https://www.uscis.gov/citizenship"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
              USCIS Citizenship Test page
            </Link>{" "}
            for the latest information.
          </Typography>

          <Typography variant="body2">
            The answers are evaluated by a Large Language Model (LLM), so they
            don't need to be exact matches. The LLM assesses the answers with
            high precision, similar to a real-world test.
          </Typography>

          <Typography variant="body2">
            If you encounter any issues, please email me at{" "}
            <Link href="mailto:bohdan.kornatskyi@gmail.com" underline="hover">
              bohdan.kornatskyi@gmail.com
            </Link>{" "}
            or create an issue on the{" "}
            <Link
              href="https://github.com/kornatskyi/civics-test-prep"
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
