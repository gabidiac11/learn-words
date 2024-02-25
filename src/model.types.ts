export enum RecordType {
  Srt = "Srt",
  LinkArticle = "LinkArticle",
  LinkYt = "LinkYt",
  Text = "Text",
}

export type Record = {
  key: string;
  name: string;
  wordsToLearn: string[];
} & (
  | {
      type: RecordType.Srt;
      content: string;
    }
  | { type: RecordType.Text; content: string }
  | { type: RecordType.LinkArticle }
  | { type: RecordType.LinkYt }
);
