import { uuidv4 } from "@firebase/util";
import { useCallback } from "react";
import { Uuid, Words } from "../app-context/types";
import { useAppStateContext } from "../app-context/useAppState";
import { useLearningCtxActions } from "../app-context/useLearningCtxActions";
import { Record, RecordType } from "../model.types";
import { useDatabase } from "./useDatabase";

const toWords = (data?: { [key: Uuid]: string }) =>
  Object.entries(data ?? {}).reduce((prev, [id, w]) => {
    prev[w] = id;
    return prev;
  }, {} as Words);

export const useWordFunctions = () => {
  const { get, set, remove } = useDatabase();
  const { setLearnedWords, setWordsToLearn } = useLearningCtxActions();
  const { learnedWords, wordsToLearn } = useAppStateContext();

  const initLearnedWords = useCallback(async (): Promise<any> => {
    const result = await get<{ [key: Uuid]: string }>(`learned-words`);
    if (result.isError()) {
      throw result;
    }
    setLearnedWords(toWords(result.data));
  }, [get, setLearnedWords]);

  const initWordsToLearn = useCallback(async (): Promise<any> => {
    const result = await get<{ [key: Uuid]: string }>(`words-to-learn`);
    if (result.isError()) {
      throw result;
    }
    setWordsToLearn(toWords(result.data));
  }, [get, setWordsToLearn]);

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
        wordsToLearn: {},
      };
    },
    [
      // set
    ]
  );

  const addLearnedWord = useCallback(
    async (word: string): Promise<any> => {
      const id = uuidv4();
      const result = await set(`learned-words/${id}`, word);
      if (result.isError()) {
        throw result;
      }

      setLearnedWords({
        ...learnedWords,
        [word]: id,
      });
      return id;
    },
    [learnedWords, set, setLearnedWords]
  );

  const removeLearnedWord = useCallback(
    async (word: string, id: string): Promise<any> => {
      const result = await remove(`learned-words/${id}`);
      if (result.isError()) {
        throw result;
      }

      const learnedWordsUpdated = {
        ...learnedWords,
      };
      delete learnedWordsUpdated[word];
      setLearnedWords(learnedWordsUpdated);
    },
    [learnedWords, remove, setLearnedWords]
  );

  const addWordToLearningList = useCallback(
    async (word: string): Promise<any> => {
      const id = uuidv4();
      const resultGlob = await set(`words-to-learn/${id}`, word);
      if (resultGlob.isError()) {
        throw resultGlob;
      }
      setWordsToLearn({
        ...wordsToLearn,
        [word]: id,
      });
    },
    [set, setWordsToLearn, wordsToLearn]
  );

  const removeWordFromLearningList = useCallback(
    async (word: string, id: string): Promise<any> => {
      const resultGlob = await remove(`words-to-learn/${id}`);
      if (resultGlob.isError()) {
        throw resultGlob;
      }
      const wordsToLearnUpdated = { ...wordsToLearn };
      delete wordsToLearnUpdated[word];
      setWordsToLearn(wordsToLearnUpdated);
    },
    [remove, setWordsToLearn, wordsToLearn]
  );

  return {
    initLearnedWords,
    initWordsToLearn,
    addSrtRecord,
    addLearnedWord,
    removeLearnedWord,
    addWordToLearningList,
    removeWordFromLearningList
  };
};
