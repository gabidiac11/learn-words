import { useEffect, useState } from "react";
import { Words } from "../app-context/types";
import { useAppStateContext } from "../app-context/useAppState";
import { PaginatedWords } from "./record/PaginatedWords/PaginatedWords";

export const WordsToLearnPage = () => {
  const { wordsToLearn } = useAppStateContext();
  const [words, setWords] = useState<[string, undefined][]>([]);

  useEffect(() => {
    setWords((oldWords) => {
      const joinedWithRemoved = {
        ...wordsToLearn,
        ...oldWords.reduce((prev, [w]) => {
          if (!wordsToLearn[w]) {
            prev[w] = "empty-id";
          }
          return prev;
        }, {} as Words),
      };
      return Object.keys(joinedWithRemoved).sort((a,b) => a > b ? 1 : -1).map((w) => [w, undefined]) as [
        string,
        undefined
      ][];
    });
  }, [wordsToLearn]);
  return (
    <div className="view page-wrapper">
      <div>
        <h3>Words to learn</h3>
      </div>
      <div className="view-content view-items">
        <PaginatedWords words={words} />
      </div>
    </div>
  );
};
