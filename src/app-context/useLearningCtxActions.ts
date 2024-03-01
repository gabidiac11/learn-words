import { useCallback } from "react";
import { Words, StateActionType, Uuid } from "./types";
import { useAppDispatch } from "./useAppDispatch";
import { useAppStateContext } from "./useAppState";

export const useLearningCtxActions = () => {
  const { dispatch } = useAppDispatch();
  const { learnedWords } = useAppStateContext();

  const setLearnedWords = useCallback(
    (words: Words) => {
      dispatch({
        type: StateActionType.SetLearnedWords,
        payload: {
          words,
        },
      });
    },
    [dispatch]
  );

  const setWordsToLearn = useCallback(
    (words: Words) => {
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
    async (word: string, uid: Uuid) => {
      const words: Words = {
        ...learnedWords,
        [word]: uid,
      };
      dispatch({
        type: StateActionType.SetLearnedWords,
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
        type: StateActionType.SetLearnedWords,
        payload: {
          words,
        },
      });
    },
    [dispatch, learnedWords]
  );

  return {
    setLearnedWords,
    setWordsToLearn,
    addLearnedWord,
    removeWordToLearn,
  };
};
