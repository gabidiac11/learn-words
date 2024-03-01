import { Typography } from "@mui/material";
import { useAppStateContext } from "../app-context/useAppState";

export const WordsToLearnPage = () => {
  const { wordsToLearn: wordsToLearnObj } = useAppStateContext();
  const wordsToLearn = Object.keys(wordsToLearnObj);
  
  return (
    <div className="view page-wrapper">
      <Typography
        variant="h1"
        noWrap
        tabIndex={0}
        component="div"
        style={{ lineHeight: "50px", paddingRight: "10px" }}
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        Words to learn
      </Typography>
      <div className="view-content view-items">
        {wordsToLearn.map((w, i) => (
          <Typography
            key={i}
            variant="h5"
            noWrap
            tabIndex={0}
            component="div"
            style={{ lineHeight: "50px", paddingRight: "10px" }}
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {w}
          </Typography>
        ))}

        {wordsToLearn.length === 0 && <div>No words.</div>}
      </div>
    </div>
  );
};
