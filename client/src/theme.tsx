/* eslint-disable @typescript-eslint/no-unused-vars */
import { createTheme } from "@mui/material/styles";
// import { red } from "@mui/material/colors";

// const american_blue = "rgba(10, 49, 97, 1.0)";
// const american_blue_semi_transparent = "rgba(10, 49, 97, 0.2)";
const white_semi_transparent = "rgba(255,255,255, 0.6)";
const american_red = "rgb(191,10,48, 1.0)";

// A custom theme for this app
const theme = createTheme({
  shape: {
    borderRadius: 10,
  },
  palette: {
    primary: {
      main: "rgb(10, 49, 97)",
    },
    secondary: {
      main: "rgb(10, 49, 97)",
    },
    error: {
      main: american_red,
    },
    background: {
      paper: white_semi_transparent,
    },
  },
  typography: {
    fontFamily: `'Merriweather', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
  },
  components: {
    MuiSvgIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.main, // Default color for icons
          "&:hover": {
            color: theme.palette.primary.main, // Change color on hover
            cursor: "help",
          },
        }),
      },
    },
  },
});

export default theme;
