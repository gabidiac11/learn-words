import { uuidv4 } from "@firebase/util";
import { useCallback } from "react";
import { Uuid, Words } from "../app-context/types";
import { useAppStateContext } from "../app-context/useAppState";
import { useLearningCtxActions } from "../app-context/useLearningCtxActions";
import { Record, RecordType } from "../model.types";
import { AppGenericError } from "./types";
import { useDatabase } from "./useDatabase";
import { useWordContentFunctions } from "./useWordContentFunctions";

const toWords = (data?: { [key: Uuid]: string }) =>
  Object.entries(data ?? {}).reduce((prev, [id, w]) => {
    prev[w] = id;
    return prev;
  }, {} as Words);

const generateRecordId = (name: string) =>
  `${name
    .slice(0, 20)
    // eslint-disable-next-line no-useless-escape
    .replace(/[\.\#\$\/\[\]\s]/g, "_")}-${uuidv4()}`;

export const useWordFunctions = () => {
  const { get, set, remove } = useDatabase();
  const { setLearnedWords, setWordsToLearn } = useLearningCtxActions();
  const { learnedWords, wordsToLearn } = useAppStateContext();
  const { isValidContent } = useWordContentFunctions();

  const initLearnedWords = useCallback(async (): Promise<any> => {
    const result = await get<{ [key: Uuid]: string }>(`learned-words`);
    result.throwIfError("Could not get learned words");

    setLearnedWords(toWords(result.data));
  }, [get, setLearnedWords]);

  const initWordsToLearn = useCallback(async (): Promise<any> => {
    const result = await get<{ [key: Uuid]: string }>(`words-to-learn`);
    result.throwIfError("Could not get words to learn");

    setWordsToLearn(toWords(result.data));
  }, [get, setWordsToLearn]);

  // const addRecordWordsToLearn = useCallback(
  //   async (recordId: string, words: [string, number][]) => {
  //     const wWordsToLearnRecord = Object.entries(wordsToLearn).reduce(
  //       (acc, [wToLearn, wordToLearnId]) => {
  //         const found = words.find(([w]) => w === wToLearn);
  //         if (!found) return acc;

  //         const [, occurences] = found;
  //         acc[wordToLearnId] = {
  //           [recordId]: occurences,
  //         };
  //         return acc;
  //       },
  //       {} as RecordWordsToLearn
  //     );

  //     (
  //       await update("words-to-learn-records", wWordsToLearnRecord)
  //     ).throwIfError("Could not add words to learn from this record");
  //   },
  //   [update, wordsToLearn]
  // );

  // const removeRecordWordsToLearn = useCallback(
  //   async (recordId: string, words: [string, number][]) => {
  //     const wWordsToLearnRecord = Object.entries(wordsToLearn).reduce(
  //       (acc, [wToLearn, wordToLearnId]) => {
  //         const found = words.find(([w]) => w === wToLearn);
  //         if (!found) return acc;

  //         acc[wordToLearnId] = {
  //           [recordId]: null,
  //         };
  //         return acc;
  //       },
  //       {} as RecordWordsToLearnRemove
  //     );

  //     (
  //       await update("words-to-learn-records", wWordsToLearnRecord)
  //     ).throwIfError("Could not remove words to learn from this record");
  //   },
  //   [update, wordsToLearn]
  // );

  const addTextRecord = useCallback(
    async (name: string, content: string): Promise<Record> => {
      if (!isValidContent(content)) {
        throw new AppGenericError("Content should contain words.");
      }
      const recordId = generateRecordId(name);
      // const result = await set(`records/${recordId}`, {
      //   type: RecordType.File,
      //   name,
      //   content,
      // });
      // result.throwIfError("Could not add record");

      return {
        id: recordId,
        name,
        content,
        type: RecordType.Text,
      };
    },
    [isValidContent]
  );

  const removeRecord = useCallback(
    async (recordId: string): Promise<any> => {
      const result = await remove(`records/${recordId}`);
      result.throwIfError("Could not remove record");
    },
    [remove]
  );

  const addLearnedWord = useCallback(
    async (word: string): Promise<any> => {
      const id = uuidv4();
      const result = await set(`learned-words/${id}`, word);
      result.throwIfError(`Could not add '${word}' to learned words`);

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
      result.throwIfError(`Could not remove '${word}' from learned words`);

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
      const result = await set(`words-to-learn/${id}`, word);
      result.throwIfError(`Could not add '${word}' to words to learn`);

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

    addTextRecord,
    removeRecord,

    addLearnedWord,
    removeLearnedWord,

    addWordToLearningList,
    removeWordFromLearningList,
  };
};
