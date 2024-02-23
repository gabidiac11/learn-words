import { Box, LinearProgress } from "@mui/material";
import { useEffect } from "react";

export const Loader = () => {
  useEffect(() => {}, []);
  return (
    <Box tabIndex={0} aria-label="Loading" sx={{ width: "100%" }}>
      <LinearProgress />
    </Box>
  );
};

export const LoaderView = () => {
    useEffect(() => {}, []);
    return (
        <div className="view">
        <Loader />
      </div>
    );
  };

export const OverLayLoader = () => {
  return (
    <div
      tabIndex={0}
      aria-label="Loading"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    </div>
  );
};
