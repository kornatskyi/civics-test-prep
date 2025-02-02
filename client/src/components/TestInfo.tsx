/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Box,
  Button,
  Container,
  Link,
  List,
  ListItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import { Question } from "../api";
import { SubmissionResult, useTest } from "./useTest.ts";
import InfoIcon from "@mui/icons-material/Info";
import theme from "../theme.tsx";
import ErrorAlert from "./ErrorAlert.tsx";
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
