import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { TestConfig, TestType } from "../api";
import theme from "../theme";

interface TestSelectionProps {
  configs: TestConfig[];
  onSelectTest: (testType: TestType, config: TestConfig) => void;
}

interface TestCardProps {
  config: TestConfig;
  onSelect: () => void;
  isHighlighted?: boolean;
}

const TestCard: React.FC<TestCardProps> = ({
  config,
  onSelect,
  isHighlighted = false,
}) => {
  return (
    <Card
      sx={{
        flex: 1,
        minWidth: 280,
        maxWidth: 400,
        border: isHighlighted ? `2px solid ${theme.palette.primary.main}` : "none",
        position: "relative",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      {isHighlighted && (
        <Box
          sx={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: theme.palette.primary.main,
            color: "white",
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: "0.75rem",
            fontWeight: "bold",
          }}
        >
          CURRENT VERSION
        </Box>
      )}
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          p: 3,
        }}
      >
        <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
          {config.testType === "2008" ? "2008 Test" : "2025 Test"}
        </Typography>

        <Box sx={{ my: 2 }}>
          <Typography variant="body1" color="text.secondary">
            <strong>{config.totalQuestions}</strong> questions in bank
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>{config.questionsAsked}</strong> questions asked
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>{config.passThreshold}</strong> correct to pass
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            px: 2,
            py: 1,
            borderRadius: 1,
            mb: 2,
            width: "100%",
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            {config.filingDateInfo}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={onSelect}
          sx={{ mt: 1, minWidth: 150 }}
        >
          Start Test
        </Button>
      </CardContent>
    </Card>
  );
};

const TestSelection: React.FC<TestSelectionProps> = ({
  configs,
  onSelectTest,
}) => {
  const test2008 = configs.find((c) => c.testType === "2008");
  const test2025 = configs.find((c) => c.testType === "2025");

  return (
    <Container
      sx={{
        backgroundColor: theme.palette.background.default,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignSelf: "center",
        backdropFilter: "blur(2px)",
        padding: { xs: "20px", sm: "30px" },
        mt: { xs: 3, sm: 5, md: 8 },
        borderRadius: theme.shape.borderRadius,
        mb: { xs: 3, sm: 5, md: 8 },
      }}
    >
      <Typography
        variant="h5"
        color="primary"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        Which test should you take?
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          backgroundColor: "rgba(10, 49, 97, 0.1)",
          p: 2,
          borderRadius: 1,
          mb: 3,
          maxWidth: 700,
        }}
      >
        <InfoIcon sx={{ color: theme.palette.primary.main, mt: 0.3 }} />
        <Typography variant="body2" color="text.secondary">
          Starting <strong>October 20, 2025</strong>, USCIS introduced a new
          128-question civics test. The test you take depends on when you filed
          your Form N-400. If you filed <strong>before</strong> October 20, 2025,
          take the 2008 test. If you filed <strong>on or after</strong> October
          20, 2025, take the 2025 test.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          justifyContent: "center",
          width: "100%",
          mt: 2,
        }}
      >
        {test2008 && (
          <TestCard
            config={test2008}
            onSelect={() => onSelectTest("2008", test2008)}
          />
        )}
        {test2025 && (
          <TestCard
            config={test2025}
            onSelect={() => onSelectTest("2025", test2025)}
            isHighlighted={true}
          />
        )}
      </Box>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          For official information about the naturalization test, visit the{" "}
          <Link
            href="https://www.uscis.gov/citizenship/learn-about-citizenship/the-naturalization-interview-and-test"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            USCIS website
          </Link>
          .
        </Typography>
      </Box>
    </Container>
  );
};

export default TestSelection;
