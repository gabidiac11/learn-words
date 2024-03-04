import axios from "axios";
import { useCallback } from "react";
import { Words } from "../app-context/types";
import { AppGenericError, ContentSection } from "./types";
import { allowedUrlFetch } from "./urlSources";

// Original regex: \«\#\$\%\^\&\*_\+\~@\!\?\.,\/\^\*;:{}=\-_`~()“”‘’'"\[\]\->:,\s\n\r\d\0
const nonWordRegexStr = `\\—\\«\\#\\$\\%\\^\\&\\*_\\+\\~@\\!\\?\\.,\\/\\^\\*;:{}=\\-_\`~()“”‘’'"\\[\\]\\->:,\\s\\n\\r\\d\\0`;
const regexes = {
  splitRegex: new RegExp(`[${nonWordRegexStr}]+`, "i"),
  classifiedRegex: new RegExp(
    `([${nonWordRegexStr}]+)|([^${nonWordRegexStr}]+)`,
    "gi"
  ),
  isNonWordRegex: new RegExp(`^[${nonWordRegexStr}]+$/`),
  containsWordRegex: new RegExp(`[^${nonWordRegexStr}]+`),
};

export const useWordContentFunctions = () => {
  const extractWords = useCallback((content: string): [string, number][] => {
    const words = content
      .split(regexes.splitRegex)
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
        content.match(regexes.classifiedRegex)?.reduce((prev, w) => {
          const currentItem: ContentSection = {
            content: w,
            isLearned: !!learnedWords[w?.toLocaleLowerCase()],
          };

          if (regexes.isNonWordRegex.test(w)) {
            currentItem.isLearned = true;
          }

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

  const containsWords = useCallback(
    (content: string) => regexes.containsWordRegex.test(content),
    []
  );

  const fetchUrlContent = useCallback(
    async (url: string): Promise<{ name: string; content: string }> => {
      const source = allowedUrlFetch.find((f) => f.regex.test(url));
      if (!source) {
        throw new AppGenericError(`Url source is not allowed`);
      }

      const { data: html } = await axios.get<string>(url, {
        headers: {
          "Content-Type": "text/html",
        },
      });
      if (!html) {
        throw new AppGenericError(
          `Ups! Something went wrong. Could not fetch content.`
        );
      }
      return await source.parse(html);
    },
    []
  );

  return {
    readFile,
    extractWords,
    extractClassifiedContent,
    containsWords,
    fetchUrlContent,
  };
};
