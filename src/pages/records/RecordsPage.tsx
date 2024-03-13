import { useMemo, useRef, useState } from "react";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Chip from "@mui/joy/Chip";
import Typography from "@mui/joy/Typography";
import moment from "moment";
import { LearningRecord } from "../../model.types";
import {
  PaginatedResults,
  PaginationDropdownProps,
} from "../../components/PaginatedResults/PaginatedResults";
import { useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@mui/joy";
import { routes } from "../../routes";
import { useWordFunctions } from "../../core/useWordFunctions";
import { allowedSources } from "../../core/sources";
import "./RecordsPage.scss";
import { useAppStateContext } from "../../app-context/useAppState";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";

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

type LearningRecordWithStats = LearningRecord & {
  stats?: [string, number][];
};

function countOccurrences(text: string, word: string) {
  const matches = text.match(new RegExp("\\s" + word + "\\s", "gi"));
  return matches ? matches.length : 0;
}

const getPaginatedRecords = async (
  page: number,
  pageSize: number,
  allRecords: LearningRecord[],
  filterValues: string[]
): Promise<[LearningRecord[], number]> => {
  return await new Promise((resolve) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize - 1;
    let r = allRecords;
    if (filterValues.length) {
      r = r
        .map((i) => {
          const stats: [string, number][] = [];
          let score = 0;
          filterValues.forEach((s) => {
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

export default function Records() {
  const { getRecords } = useWordFunctions();
  const recordsRef = useRef<LearningRecord[]>();
  const { wordsToLearn } = useAppStateContext();

  const filterOptions = useMemo(() => {
    const items = Object.keys(wordsToLearn);
    return {
      icon: <FormatColorTextIcon />,
      label: "To learn",
      options: items
        .sort((a, b) => {
          if (a > b) return 1;
          return -1;
        })
        .map((w) => ({ value: w, label: w })),
    } as PaginationDropdownProps;
  }, [wordsToLearn]);

  const onChangePaginatin = useCallback(
    async (page: number, pageSize: number, filterValues: string[]) => {
      // we use mânăreală here because firebase db doesn't provide pagination...
      const results = recordsRef.current ?? (await getRecords());
      if(!recordsRef.current) recordsRef.current = results;

      // const [records, total] = await getPaginatedRecordsMock(page, pageSize);
      const [records, total] = await getPaginatedRecords(
        page,
        pageSize,
        results,
        filterValues
      );
      return {
        total,
        items: records.map((r) => <RecordItem {...r} />),
      };
    },
    [getRecords]
  );

  return (
    <div className="view page-wrapper">
      <div className="view-content records-container">
        <h3>Records</h3>
        <PaginatedResults
          filterOptions={filterOptions}
          onChange={onChangePaginatin}
        />
      </div>
    </div>
  );
}

function getRecordName(name: string) {
  const limit = 100;
  if (name.length < limit) return name;
  return name.slice(0, limit - 3) + "...";
}

function RecordItem(record: LearningRecordWithStats) {
  const [name] = useState(getRecordName(record.name));
  const [date] = useState(
    moment(record.timestamp).format("MMMM Do YYYY, h:mm:ss a")
  );
  const [sourceName] = useState(
    record.source ? new URL(record.source).hostname : null
  );
  const [sourceImage] = useState(
    allowedSources.find((s) => s.regex().test(record.source ?? ""))?.img
  );

  // TODO: add a checkbox with words to learn when searching by that sort by num of occurences (totals), date
  return (
    <RouterLink
      className="no-anchor record-item"
      to={`${routes.Record.path.replace(":id", record.id)}`}
    >
      <Card
        variant="outlined"
        orientation="horizontal"
        className="record-card"
        sx={{
          width: 220,
          "&:hover": {
            boxShadow: "md",
            borderColor: "neutral.outlinedHoverBorder",
          },
        }}
      >
        <CardContent>
          <Typography className="pb-5 record-name">{name}</Typography>
          <Chip
            className="mb-5 pt-5 pb-5 pl-10 pr-10"
            variant="outlined"
            color="primary"
            size="sm"
            sx={{ pointerEvents: "none" }}
          >
            {date}
          </Chip>
          {sourceName && (
            <Link
              onClick={(e) => {
                e.stopPropagation();
              }}
              href={record.source}
              target="_blank"
              style={!sourceName ? { visibility: "hidden" } : {}}
            >
              <Chip
                className="mb-5"
                variant="outlined"
                color="primary"
                size="sm"
                sx={{ pointerEvents: "none" }}
              >
                <div className="flex-center-all p-5">
                  {sourceImage && (
                    <img alt={sourceName} className="mr-10" src={sourceImage} />
                  )}
                  <div>{sourceName}</div>
                </div>
              </Chip>
            </Link>
          )}
          {!!record.stats &&
            record.stats.map(([word, occurences], i) => (
              <div key={i} className="pt-10">
                {word}: {occurences}
              </div>
            ))}
        </CardContent>
      </Card>
    </RouterLink>
  );
}
