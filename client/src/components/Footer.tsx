/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, css, Link, Typography } from "@mui/material";

type FooterProps = {};

function Footer({}: FooterProps) {
  return (
    <>
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
          Please refer to the{" "}
          <Link
            href="https://www.uscis.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            official U.S. government website
          </Link>
          for the latest and most accurate information on the U.S.
          Naturalization test.
        </Typography>
      </Box>
    </>
  );
}

export default Footer;
