import axios from "axios";
import { Words } from "../app-context/types";
import { allowedSources } from "./sources";
import { AppGenericError, ContentSection } from "./types";
import { uuidv4 } from "@firebase/util";

// base regex: /[\p{L}_]+/ug
const regexes = {
  splitRegex: () => /[^\p{L}_]+/iu,
  classifiedRegex: () => /([^\p{L}_]+)|([\p{L}_]+)/giu,
  isNonWordRegex: () => /^[^\p{L}_]+$/u,
  containsWordRegex: () => /[\p{L}_]+/u,
};

export const generateRecordId = (name: string, timestamp: number) =>
  `${timestamp}-${name.slice(0, 20).replace(/[^\p{L}_]+/giu, "_")}-${uuidv4()}`;

export const extractWords = (content: string): [string, number][] => {
  const words = content
    .split(regexes.splitRegex())
    .filter((i) => !!i)
    .reduce((acc, w) => {
      const lw = w.toLowerCase();
      acc[lw] = (acc[lw] ?? 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

  const wordsOrdered = Object.entries(words).sort(([, count1], [, count2]) => {
    if (count1 === count2) return 0;
    return count1 > count2 ? -1 : 1;
  });
  return wordsOrdered;
};

export const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
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

export const extractClassifiedContent = (
  content: string,
  learnedWords: Words
): ContentSection[] => {
  const sections = (
    content.match(regexes.classifiedRegex())?.reduce((prev, w) => {
      const newItem: ContentSection = {
        content: w,
        isLearned: !!learnedWords[w?.toLocaleLowerCase()],
        translateUrl: "",
        translateUrlAndroid: "",
      };

      if (regexes.isNonWordRegex().test(w)) {
        newItem.isLearned = true;
      }

      if (prev.length === 0) {
        prev.push(newItem);
      } else if (prev[prev.length - 1].isLearned === newItem.isLearned) {
        prev[prev.length - 1].content += newItem.content;
      } else {
        prev.push(newItem);
      }
      return prev;
    }, [] as ContentSection[]) ?? []
  ).map((section) => {
    if (!section.isLearned) {
      section.translateUrl = `https://translate.google.com/?sl=ru&tl=en&text=${encodeURIComponent(
        section.content
      )}&op=translate`;

      section.translateUrlAndroid = `intent://translate.google.com/?sl=ru&tl=en&text=${encodeURIComponent(
        section.content
      )}#Intent;scheme=https;package=com.google.android.apps.translate;end`;
    }
    return section;
  });

  return sections;
};

export const containsWords = (content: string) =>
  regexes.containsWordRegex().test(content);

export const fetchUrlContent = async (
  url: string
): Promise<{ name: string; content: string }> => {
  if (!url) throw new AppGenericError("Empty url.");

  const source = allowedSources.find((f) => f.regex().test(url));
  if (!source) {
    throw new AppGenericError(`Url is not supported`);
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
  return { ...(await source.parse(html, url)) };
};
