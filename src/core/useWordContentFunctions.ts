import { useCallback } from "react";
import { Words } from "../app-context/types";
import { AppGenericError, ContentSection } from "./types";

export const useWordContentFunctions = () => {
  const extractWords = useCallback((content: string): [string, number][] => {
    const words = content
      .split(
        // eslint-disable-next-line no-useless-escape
        /[\#\$\%\^\&\*_\+\~@\!\?\.,\/\^\*;:{}=\-_`~()“”‘’'"\[\]\->:,\s\n\r\d\0]+/i
      )
      .filter((i) => !!i)
      .reduce((acc, w) => {
        const lw = w.toLowerCase();
        acc[lw] = (acc[lw] ?? 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

    const wordsOrdered = Object.entries(words).sort(
      ([, count1], [, count2]) => {
        if (count1 === count2) return 0;
        return count1 > count2 ? -1 : 1;
      }
    );
    return wordsOrdered;
  }, []);

  const readFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const onError = (e: ProgressEvent<FileReader>) => {
        const error = new AppGenericError(
          e.target?.error?.message ?? "Something went wrong.",
          e.target?.error
        );
        reject(error);
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve((e.target?.result as string | undefined) ?? "");
      };
      reader.onabort = onError;
      reader.onerror = onError;

      reader.readAsText(file);
    });
  }, []);

  const extractClassifiedContent = useCallback(
    (content: string, learnedWords: Words): ContentSection[] => {
      const sections =
        content
          .match(
            // eslint-disable-next-line no-useless-escape
            /([\#\$\%\^\&\*_\+\~@\!\?\.,\/\^\*;:{}=\-_`~()“”‘’'"\[\]\->:,\s\n\r\d\0]+)|([^\#\$\%\^\&\*_\+\~@\!\?\.,\/\^\*;:{}=\-_`~()“”‘’'"\[\]\->:,\s\n\r\d\0]+)/gi
          )
          ?.reduce((prev, w) => {
            const currentItem: ContentSection = {
              content: w,
              isLearned: !!learnedWords[w?.toLocaleLowerCase()],
            };

            if (prev.length === 0) {
              prev.push(currentItem);
              return prev;
            }

            if (prev[prev.length - 1].isLearned === currentItem.isLearned) {
              prev[prev.length - 1].content += currentItem.content;
            } else {
              prev.push(currentItem);
            }
            return prev;
          }, [] as ContentSection[]) ?? [];

      return sections;
    },
    []
  );

  const isValidContent = useCallback(
    (content: string) =>
      // eslint-disable-next-line no-useless-escape
      /[^\#\$\%\^\&\*_\+\~@\!\?\.,\/\^\*;:{}=\-_`~()“”‘’'"\[\]\->:,\s\n\r\d\0]+/.test(
        content
      ),
    []
  );

  return {
    readFile,
    extractWords,
    extractClassifiedContent,
    isValidContent
  };
};
