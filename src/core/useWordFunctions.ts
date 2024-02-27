import { uuidv4 } from "@firebase/util";
import { useCallback } from "react";
import { useAppStateContext } from "../app-context/useAppState";
import { useLearningCtxActions } from "../app-context/useLearningCtxActions";
import { Record, RecordType } from "../model.types";
import { AppGenericError } from "./types";
import { useDatabase } from "./useDatabase";

export const useWordFunctions = () => {
  const { getArray, set, remove } = useDatabase();
  const { setLearnedWords, setWordsToLearn } = useLearningCtxActions();
  const { learnedWords } = useAppStateContext();

  const initLearnedWords = useCallback(async (): Promise<any> => {
    const result = await getArray<string>(`learned-words`);
    if (result.isError() || !result.data) {
      throw result;
    }
    const words = (result.data ?? []).reduce((prev, w) => {
      prev[w] = true;
      return prev;
    }, {} as { [key: string]: true });
    setLearnedWords(words);
  }, [getArray, setLearnedWords]);

  const initWordsToLearn = useCallback(async (): Promise<any> => {
    const result = await getArray<string>(`words-to-learn`);
    if (result.isError() || !result.data) {
      throw result;
    }
    setWordsToLearn(result.data);
  }, [getArray, setWordsToLearn]);

  const addSrtRecord = useCallback(
    async (name: string, content: string): Promise<Record> => {
      const key = `${name
        .slice(0, 20)
        // eslint-disable-next-line no-useless-escape
        .replace(/[\.\#\$\/\[\]\s]/g, "_")}-${uuidv4()}`;
      // const result = await set(`records/${key}`, {
      //   type: RecordType.Srt,
      //   name,
      //   content,
      // });
      // if (result.isError()) {
      //   throw result;
      // }

      return {
        key,
        name,
        content,
        type: RecordType.Srt,
        wordsToLearn: [],
      };
    },
    [
      // set
    ]
  );

  const addLearnedWord = useCallback(
    async (word: string): Promise<any> => {
      const result = await set(
        `learned-words/${(Object.keys(learnedWords).length || 1) - 1}`,
        word
      );
      if (result.isError()) {
        throw result;
      }

      setLearnedWords({
        ...learnedWords,
        [word]: true,
      });
    },
    [learnedWords, set, setLearnedWords]
  );

  const removeLearnedWord = useCallback(
    async (word: string): Promise<any> => {
      const wordIndex = Object.keys(learnedWords).indexOf(word);
      if (wordIndex < 0) {
        throw new AppGenericError("Word is not learned actually.");
      }

      const result = await remove(`learned-words/${wordIndex}`);
      if (result.isError()) {
        throw result;
      }

      const newLearnedWords = {
        ...learnedWords,
      };
      delete newLearnedWords[word];
      setLearnedWords(newLearnedWords);
    },
    [learnedWords, remove, setLearnedWords]
  );

  return {
    initLearnedWords,
    initWordsToLearn,
    addSrtRecord,
    addLearnedWord,
    removeLearnedWord,
  };
};
