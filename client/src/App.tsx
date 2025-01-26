import { Box, css, Typography, useTheme } from "@mui/material";
import background from "./assets/charles-duck-unitas-hPq1nLfLgBY-unsplash.jpg";
import TestCard from "./components/TestCard";
import Footer from "./components/Footer";

const appContainer = css({
  backgroundImage: `url(${background})`, // Use the correct syntax
  backgroundSize: "cover", // Optional: Ensure the image covers the container
  backgroundRepeat: "no-repeat", // Optional: Avoid repeating the image
  backgroundPosition: "center", // Optional: Center the image
  width: "100%", // Ensure the container has proper dimensions
  height: "100vh", // Set height to viewport height
  display: "flex",
  flexDirection: "column",
  padding: 50,
});

function App() {
  const theme = useTheme();

  return (
    <div css={appContainer}>
      <Box
        component={"header"}
        sx={{
          // backgroundColor: white_semi_transparent,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: theme.palette.primary.dark,
        }}
      >
        <Typography
          align="center"
          color="primary"
          css={css({
            alignSelf: "center",
            margin: 30,
            marginBottom: 60,
          })}
          variant="h4"
        >
          U.S. NATURALIZATION TEST PRACTICE
        </Typography>
      </Box>
      <TestCard />
      <Footer />
    </div>
  );
}

export default App;
