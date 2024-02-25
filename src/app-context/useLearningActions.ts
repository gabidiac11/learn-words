import { useCallback } from "react";
import { StateActionType } from "./types";
import { useAppDispatch } from "./useAppDispatch";

export const useLearningActions = () => {
  const { dispatch } = useAppDispatch();

  const setLearnWords = useCallback(
    (words: string[]) => {
      dispatch({
        type: StateActionType.SetKnownWords,
        payload: {
          words
        },
      });
    },
    [dispatch]
  );

  const setWordsToLearn = useCallback(
    (words: string[]) => {
      dispatch({
        type: StateActionType.SetKnownWords,
        payload: {
          words
        },
      });
    },
    [dispatch]
  );

  return {
    setLearnWords,
    setWordsToLearn
  };
};
