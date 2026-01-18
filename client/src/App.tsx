import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import background from "./assets/charles-duck-unitas-hPq1nLfLgBY-unsplash.jpg";
import Header from "./components/Header";
import TestCard from "./components/TestCard";
import TestSelection from "./components/TestSelection";
import { getTestConfigs, TestConfig, TestType } from "./api";
import theme from "./theme";

type AppState = "loading" | "selection" | "test";

function App() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [configs, setConfigs] = useState<TestConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<TestConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const testConfigs = await getTestConfigs();
        setConfigs(testConfigs);
        setAppState("selection");
      } catch (err) {
        console.error("Failed to load test configs:", err);
        setError("Failed to load test configurations. Please refresh the page.");
        setAppState("selection");
      }
    };
    loadConfigs();
  }, []);

  const handleSelectTest = (_testType: TestType, config: TestConfig) => {
    setSelectedConfig(config);
    setAppState("test");
  };

  const handleChangeTest = () => {
    setSelectedConfig(null);
    setAppState("selection");
  };

  const renderContent = () => {
    if (appState === "loading") {
      return (
        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
          <Typography sx={{ mt: 2 }} color="primary">
            Loading...
          </Typography>
        </Container>
      );
    }

    if (error) {
      return (
        <Container
          sx={{
            backgroundColor: theme.palette.background.default,
            padding: "30px",
            borderRadius: theme.shape.borderRadius,
            mt: 5,
            textAlign: "center",
          }}
        >
          <Typography color="error">{error}</Typography>
        </Container>
      );
    }

    if (appState === "selection") {
      return (
        <TestSelection configs={configs} onSelectTest={handleSelectTest} />
      );
    }

    if (appState === "test" && selectedConfig) {
      return (
        <TestCard config={selectedConfig} onChangeTest={handleChangeTest} />
      );
    }

    return null;
  };

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
        {renderContent()}
      </Container>
    </Box>
  );
}

export default App;
