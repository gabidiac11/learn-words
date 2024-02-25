import { useCallback } from "react";
import { AppGenericError } from "./types";

export const useFileFunctions = () => {
  const extractWords = useCallback((content: string): string[] => {
    // eslint-disable-next-line no-useless-escape
    const words = content.split(/[\#\$\%\^\&\*_\+\~@\!\.,\/\^\*;:{}=\-_`~()“”‘’'"\[\]\->:,\s\n\r\d\0]+/i).filter(i => !!i);
    return words;
  }, [])

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
    readFile
  }
}

