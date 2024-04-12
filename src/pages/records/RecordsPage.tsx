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
import DeleteIcon from "@mui/icons-material/Cancel";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { useAppEvents } from "../../hooks/useAppEvents";

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
  const { emitPaginationTrigger } = useAppEvents();

  const [pageRecords, setPageRecords] = useState<LearningRecord[]>([]);

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
      if (!recordsRef.current) recordsRef.current = results;

      // const [records, total] = await getPaginatedRecordsMock(page, pageSize);
      const [records, total] = await getPaginatedRecords(
        page,
        pageSize,
        results,
        filterValues
      );

      setPageRecords(records);
      return {
        total,
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
          items={pageRecords}
          renderItem={(item: any) => {
            const r = item as LearningRecord;
            return (
              <RecordItem
                key={r.id}
                record={r}
                afterRemove={(id) => {
                  recordsRef.current = recordsRef.current?.filter(
                    (f) => f.id !== id
                  );
                  emitPaginationTrigger();
                }}
              />
            );
          }}
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

function RecordItem({
  record,
  afterRemove,
}: {
  record: LearningRecordWithStats;
  afterRemove: (id: string) => void;
}) {
  const { removeRecord } = useWordFunctions();
  const { displayError, displaySuccess } = useUIFeedback();

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

  const onRemoveRecord = useCallback(async () => {
    try {
      await removeRecord(record.id);
      displaySuccess("Record deleted.");
      afterRemove(record.id);
    } catch (error) {
      console.error(error);
      displayError(error);
    }
  }, [afterRemove, displayError, displaySuccess, record.id, removeRecord]);

  return (
    <div className="record-wrapper" itemID={record.id}>
      <button
        onClick={() => onRemoveRecord()}
        className="no-btn btn-rec-delete"
      >
        <DeleteIcon fontSize="medium" />
      </button>
      <div className="record-item">
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
            <Typography className="pb-5 record-name">
              <RouterLink
                className="no-anchor underline"
                to={`${routes.Record.path.replace(":id", record.id)}`}
              >
                {name}
              </RouterLink>
            </Typography>
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
              <div>
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
                        <img
                          alt={sourceName}
                          className="mr-10"
                          src={sourceImage}
                        />
                      )}
                      <div>{sourceName}</div>
                    </div>
                  </Chip>
                </Link>
              </div>
            )}
            {!!record.stats &&
              record.stats.map(([word, occurences], i) => (
                <div key={i} className="pt-10">
                  {word}: {occurences}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
