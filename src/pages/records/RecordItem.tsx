import { useState } from "react";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Chip from "@mui/joy/Chip";
import Typography from "@mui/joy/Typography";
import moment from "moment";
import { useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@mui/joy";
import { routes } from "../../routes";
import { useWordFunctions } from "../../core/useWordFunctions";
import { allowedSources } from "../../core/sources";
import DeleteIcon from "@mui/icons-material/Cancel";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { LearningRecord } from "../../model.types";

export type LearningRecordWithStats = LearningRecord & {
  stats?: [string, number][];
};

function getRecordName(name: string) {
  const limit = 100;
  if (name.length < limit) return name;
  return name.slice(0, limit - 3) + "...";
}

export function RecordItem({
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
