import { Box, Container } from "@mui/material";
import background from "./assets/charles-duck-unitas-hPq1nLfLgBY-unsplash.jpg";
import Header from "./components/Header";
import TestCard from "./components/TestCard";
import Footer from "./components/Footer";

function App() {
  return (
    <Box
      sx={{
        background: `url(${background}) center/cover no-repeat`,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          py: 4,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Header />
        <TestCard />
        <Footer />
      </Container>
    </Box>
  );
}

export default App;
