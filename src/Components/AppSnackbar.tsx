import { Alert, Snackbar } from "@mui/material";
import { useAppStateContext } from "../app-context/useAppState";
import { useSnackActions } from "../app-context/useSnackActions";

export const AppSnackbar = () => {
  const { removeSnack } = useSnackActions();
  const { snack } = useAppStateContext();

  return (
    <>
      {snack && (
        <Snackbar
          key={snack.key}
          open={true}
          autoHideDuration={snack.autoHideDuration ?? 3000}
          onClose={() => removeSnack(snack.key)}
        >
          <Alert
            onClose={() => removeSnack(snack.key)}
            severity={snack.severity ?? "error"}
            sx={{ width: "100%" }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};
