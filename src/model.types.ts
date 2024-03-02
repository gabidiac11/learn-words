import { Words } from "./app-context/types";

export enum RecordType {
  Srt = "Srt",
  LinkArticle = "LinkArticle",
  LinkYt = "LinkYt",
  Text = "Text",
}

export type Record = {
  id: string;
  name: string;
  wordsToLearn: Words;
} & (
  | {
      type: RecordType.Srt;
      content: string;
    }
  | { type: RecordType.Text; content: string }
  | { type: RecordType.LinkArticle }
  | { type: RecordType.LinkYt }
);
