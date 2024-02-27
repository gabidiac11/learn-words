import { Typography } from "@mui/material";
import { useAppStateContext } from "../app-context/useAppState";

export const LearnedWordsPage = () => {
  const { learnedWords: learnWordsObj } = useAppStateContext();
  const learnedWords = Object.keys(learnWordsObj);

  // TODO: add pagination, option to remove
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
        Learned Words
      </Typography>

      <div className="view-content view-items">
        {learnedWords.map((w, i) => (
          <Typography
            key={i}
            variant="h3"
            noWrap
            tabIndex={0}
            component="div"
            style={{ lineHeight: "50px", paddingRight: "10px" }}
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {w}
          </Typography>
        ))}
        {learnedWords.length === 0 && <div>No words.</div>}
      </div>
    </div>
  );
};