
import { LearningRecord } from "../../model.types";

// const mockRecords: LearningRecord[] = Array.from({ length: 1000 }).map(
//   (v, i) => ({
//     id: uuidv4(),
//     content: "",
//     name: `Record #${i + 1}`,
//     timestamp: Date.now(),
//     source:
//       i % 5 === 0
//         ? "https://firebase.google.com/docs/firestore/query-data/query-cursors"
//         : undefined,
//   })
// );

export function countOccurrences(text: string, word: string) {
  const matches = text.match(new RegExp("\\s" + word + "\\s", "gi"));
  return matches ? matches.length : 0;
}

export const getPaginatedRecords = async (
  page: number,
  pageSize: number,
  allRecords: LearningRecord[],
  toLearnFilters: string[],
  _searchValue: string
): Promise<[LearningRecord[], number]> => {
  const searchValue = _searchValue.toLowerCase();
  return await new Promise((resolve) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize - 1;
    let r = allRecords;
    if (searchValue) {
      r = r
        .map((item) => ({
          ind: item.name.toLocaleLowerCase().indexOf(searchValue),
          val: item,
        }))
        .filter((item) => item.ind > -1)
        .sort((a, b) => {
          const sa = a.val.name.toLocaleLowerCase().indexOf(searchValue);
          const sb = b.val.name.toLocaleLowerCase().indexOf(searchValue);
          if (sa === sb) return 0;
          return sa > sb ? 1 : -1;
        })
        .map((item) => item.val);
    }
    if (toLearnFilters.length) {
      r = r
        .map((i) => {
          const stats: [string, number][] = [];
          let score = 0;
          toLearnFilters.forEach((s) => {
            const txt = i.content.toLowerCase();
            const occ = countOccurrences(txt, s);
            score += occ;
            stats.push([s, occ]);
          });
          return {
            ...i,
            stats,
            score,
          };
        })
        .sort((a, b) => {
          if (a.score === b.score) return 0;
          return a.score > b.score ? -1 : 1;
        });
    }
    r = r.filter((r, i) => i >= startIndex && i <= endIndex);

    resolve([r, allRecords.length]);
  });
};
