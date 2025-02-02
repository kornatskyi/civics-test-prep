import { Alert, useTheme } from "@mui/material";

function ErrorAlert({ error }: { error: string }) {
  const theme = useTheme();
  return (
    <Alert
      variant="filled"
      severity="error"
      sx={{
        mt: 4,
        width: "100%",
        alignSelf: "center",
        borderRadius: theme.shape.borderRadius,
      }}
    >
      {error}
    </Alert>
  );
}

export default ErrorAlert;
