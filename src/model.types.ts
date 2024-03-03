export enum RecordType {
  Text = "Text",
  Link = "Link",
}

export type Record = {
  id: string;
  type: RecordType,
  name: string;
  content: string;
};
