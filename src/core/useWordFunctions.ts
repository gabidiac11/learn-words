import { uuidv4 } from "@firebase/util";
import { useCallback } from "react";
import { Record, RecordType } from "../model.types";
import { useDatabase } from "./useDatabase";

export const useWordFunctions = () => {
  const { get, set } = useDatabase();

  const getLearntWords = useCallback(async (): Promise<string[]> => {
    const result = await get<string[]>(`learned-words`);
    if (result.isError() || !result.data) {
      throw result;
    }
    return result.data ?? [];
  }, [get]);

  const getWordsToLearn = useCallback(async (): Promise<string[]> => {
    const result = await get<string[]>(`words-to-learn`);
    if (result.isError() || !result.data) {
      throw result;
    }
    return result.data;
  }, [get]);

  const addSrtRecord = useCallback(
    async (name: string, content: string): Promise<Record> => {
      const key = `${name
        .slice(0, 20)
        // eslint-disable-next-line no-useless-escape
        .replace(/[\.\#\$\/\[\]\s]/g, "_")}-${uuidv4()}`;
      const result = await set(`records/${key}`, {
        type: RecordType.Srt,
        name,
        content,
      });
      if (result.isError()) {
        throw result;
      }

      return {
        key,
        name,
        content,
        type: RecordType.Srt,
        wordsToLearn: [],
      };
    },
    [set]
  );

  return {
    getLearntWords,
    getWordsToLearn,
    addSrtRecord,
  };
};
