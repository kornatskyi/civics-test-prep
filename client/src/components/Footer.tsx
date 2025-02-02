/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable no-empty-pattern */
import { Box, Link, Typography, useTheme } from "@mui/material";

type FooterProps = {};

function Footer({}: FooterProps) {
  const theme = useTheme();
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 2,
        px: 2,
        backgroundColor: "rgba(0,0,0,0.2)",
        textAlign: "center",
        color: "rgb(209, 209, 209)",
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <Typography variant="body2" sx={{ maxWidth: 800, mx: "auto" }}>
        {
          "This website is an unofficial resource for practice and study. For the most up-to-date and accurate information on the U.S. Naturalization process and test, please visit the official "
        }
        <Link
          href="https://www.uscis.gov/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {"USCIS website"}
        </Link>
      </Typography>
    </Box>
  );
}

export default Footer;
