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
          mt: 2,
          mb: 1,
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
          }}
        >
          <Typography variant="body2">
            Some questions, such as those about current government officials,
            are <strong>not included</strong> in this practice test because they
            change over time.
            <br />
            <br />
            Visit the
            <Link
              href="https://www.uscis.gov/citizenship"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
              {" USCIS Citizenship Test page "}
            </Link>
            for the latest information.
          </Typography>
          <Typography component={"p"} variant="body2">
            The answers are evaluated by a Large Language Model (LLM), so they
            don't need to be exact matches. The LLM assesses the answers with
            high precision, similar to a real-world test. However, there might
            be occasional discrepancies. If you encounter any issues, please
            email bohdan.kornatskyi@gmail.com or create an issue on the GitHub
            repo at https://github.com/kornatskyi/civics-test-prep.
          </Typography>
        </Box>
      ) : null}
    </>
  );
}
