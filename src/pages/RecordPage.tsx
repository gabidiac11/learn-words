import { ClearRounded } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useUIFeedback } from "../app-context/useUIFeedback";
import { Loader } from "../components/Loader";
import { PaginatedWords } from "../components/PaginatedWords/PaginatedWords";
import { RecordContent } from "../components/RecordContent/RecordContent";
import { AppGenericError } from "../core/types";
import { useWordFunctions } from "../core/useWordFunctions";
import { extractWords } from "../core/word-content/contentFunctions";
import { useRefState } from "../hooks/useRefState";
import { LearningRecord } from "../model.types";
import { getErrorMessage } from "../utils";
import { Link } from "@mui/joy";

export const RecordPage = () => {
  const { displayError, displaySuccess } = useUIFeedback();
  const { state: locationState } = useLocation();
  const { id } = useParams();
  const { removeRecord } = useWordFunctions();

  const [record, setRecord] = useState<LearningRecord>();
  const [words, setWords] = useState<[string, number][]>();

  const { getRecord } = useWordFunctions();
  const [loading, setLoading] = useRefState(true);
  const [error, setError] = useState<string>();

  const [deleted, setDeleted] = useState(false);

  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      if (!id) {
        throw new AppGenericError("Record not found.");
      }

      let r = locationState as LearningRecord;
      if (!r?.id) {
        r = await getRecord(id);
      }
      setWords(extractWords(r.content));
      setRecord(r);
    } catch (error) {
      console.error(error);
      displayError(error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [displayError, getRecord, id, locationState, setLoading]);

  const onRemoveRecord = useCallback(async () => {
    try {
      if (!record) throw new AppGenericError("Record does not exists.");

      await removeRecord(record.id);
      displaySuccess("Record deleted.");
      setDeleted(true);
      setWords(undefined);
      setRecord(undefined);
    } catch (error) {
      console.error(error);
      displayError(error);
    }
  }, [displayError, displaySuccess, record, removeRecord]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="view page-wrapper">
      <div className="view-content">
        {loading && <Loader />}
        {!loading && !!error && <div>{error}</div>}
        {!loading && !!record && !!words && (
          <>
            <div>
              <h3>
                {record.source && (
                  <Link target="_blank" underline="always" href={record.source}>
                    {record.name}
                  </Link>
                )}
                {!record.source && record.name}
              </h3>
              <Button startIcon={<ClearRounded />} onClick={onRemoveRecord}>
                Delete record
              </Button>
            </div>
            <PaginatedWords words={words} />
            <RecordContent key={record.id} content={record.content} />
          </>
        )}
        {deleted && <div>Deleted.</div>}
      </div>
    </div>
  );
};