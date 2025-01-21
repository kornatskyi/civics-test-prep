import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(10, 49, 97)",
    },
    secondary: {
      main: '#005d8d',
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: `'Merriweather', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
  },
});

export default theme;
