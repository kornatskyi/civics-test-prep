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
        backgroundColor: theme.palette.background.paper,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: theme.palette.primary.dark,
        py: 3, // vertical padding on the header
        px: 2, // optional horizontal padding
        width: "100%",
      }}
    >
      <Typography
        align="center"
        color="primary"
        variant="h4"
        sx={{ mb: 4 }} // margin bottom
      >
        U.S. NATURALIZATION TEST PRACTICE
      </Typography>
    </Box>
  );
}

export default Header;
