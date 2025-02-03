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
            The answers evaluation happens by LLM (Large language model) so the
            answers doesn't have to be precise and much the list of possible
            answers letter by later. LLM is prompted to evaluate the answer with
            good enough precision to be similar to a real world test. Though
            it's possible to get some answers marked as incorrect that might
            have been good enough on the real interview, or otherwise get them
            marked correct where in the real interview they might've been
            considered incorrect, but such occurrences should be minimum. Please
            send to my email bohdan.kornatskyi@gmail.com if you found some
            issues or create an issue on github repo
            https://github.com/kornatskyi/civics-test-prep
          </Typography>
        </Box>
      ) : null}
    </>
  );
}
