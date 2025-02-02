/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Box, Typography, useTheme } from "@mui/material";
type HeaderProps = {};

function Header({}: HeaderProps) {
  const theme = useTheme();
  return (
    <Box
      component="header"
      sx={{
        backgroundColor: theme.palette.background.default,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: theme.palette.primary.dark,
        py: 2,
        width: "100%",
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <Typography align="center" color="primary" variant="h4">
        U.S. NATURALIZATION TEST PRACTICE
      </Typography>
      <Typography sx={{ typography: { sm: "h5", xs: "h6" } }}>
        Civics test
      </Typography>
    </Box>
  );
}

export default Header;
