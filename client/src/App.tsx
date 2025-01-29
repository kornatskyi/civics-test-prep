import { Box, Container, Typography, useTheme } from "@mui/material";
import background from "./assets/charles-duck-unitas-hPq1nLfLgBY-unsplash.jpg";
import TestCard from "./components/TestCard";
import Footer from "./components/Footer";

function App() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh", // allow content to grow beyond viewport
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container
        sx={{
          pt: 4, // top padding
          pb: 4,
          flex: "1 0 auto", // allow container to expand
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        maxWidth="md"
      >
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
            borderRadius: 1, // small radius if you want a nice shape
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

        {/* The test card content */}
        <TestCard />
        {/* Footer can be placed outside or inside Container, depending on design */}
        <Footer />
      </Container>
    </Box>
  );
}

export default App;
