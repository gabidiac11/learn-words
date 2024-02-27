import { useCallback } from "react";
import { StateActionType } from "./types";
import { useAppDispatch } from "./useAppDispatch";
import { useAppStateContext } from "./useAppState";

export const useLearningCtxActions = () => {
  const { dispatch } = useAppDispatch();
  const { learnedWords } = useAppStateContext();

  const setLearnWords = useCallback(
    (words: { [key: string]: true }) => {
      dispatch({
        type: StateActionType.SetKnownWords,
        payload: {
          words,
        },
      });
    },
    [dispatch]
  );

  const setWordsToLearn = useCallback(
    (words: string[]) => {
      dispatch({
        type: StateActionType.SetWordsToLearn,
        payload: {
          words,
        },
      });
    },
    [dispatch]
  );

  const addLearnedWord = useCallback(
    async (word: string) => {
      const words: { [key: string]: true } = {
        ...learnedWords,
        [word]: true,
      };
      dispatch({
        type: StateActionType.SetKnownWords,
        payload: {
          words,
        },
      });
    },
    [dispatch, learnedWords]
  );

  const removeWordToLearn = useCallback(
    (word: string) => {
      const words = {
        ...learnedWords,
      };
      delete words[word];
      dispatch({
        type: StateActionType.SetKnownWords,
        payload: {
          words,
        },
      });
    },
    [dispatch, learnedWords]
  );

  return {
    setLearnedWords: setLearnWords,
    setWordsToLearn,
    addLearnedWord,
    removeWordToLearn,
  };
};
