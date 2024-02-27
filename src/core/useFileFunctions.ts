import { useCallback } from "react";
import { AppGenericError } from "./types";

export const useFileFunctions = () => {
  const extractWords = useCallback((content: string): [string, number][] => {
    const words = content
    .split(
        // eslint-disable-next-line no-useless-escape
        /[\#\$\%\^\&\*_\+\~@\!\?\.,\/\^\*;:{}=\-_`~()“”‘’'"\[\]\->:,\s\n\r\d\0]+/i
      )
      .filter((i) => !!i)
      .reduce((prev, w) => {
        const lw = w.toLowerCase();
        prev[lw] = (prev[lw] ?? 0) + 1;
        return prev;
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

  return {
    extractWords,
    readFile,
  };
};
