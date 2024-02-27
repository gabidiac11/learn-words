import { Typography } from "@mui/material";
import { getErrorMessage } from "../utils";

export const ErrorBoundaryFallback = ({ error }: { error: unknown }) => {
  return (
    <div
      tabIndex={0}
      className="flex-center-all"
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <Typography
        variant="h3"
        noWrap
        tabIndex={0}
        component="div"
        style={{ lineHeight: "50px", paddingRight: "10px" }}
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        Ups! Something went wrong: {getErrorMessage(error)}
      </Typography>
    </div>
  );
};
