import { Box, Link, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useState } from "react";

export default function TestInfo() {
  const [showInfo, setShowInfo] = useState(false);

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
        }}
      >
        <Typography
          onClick={() => {
            setShowInfo((prev) => !prev);
          }}
          sx={{}}
          variant="body2"
        >
          Learn about the test
        </Typography>
        &nbsp;
        <InfoIcon fontSize="inherit" sx={{ color: "primary.main" }} />
      </Box>
      {showInfo ? (
        <Typography variant="body2">
          Some questions, such as those about current government officials, are{" "}
          <strong>not included</strong> in this practice test because they
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
      ) : null}
    </>
  );
}
