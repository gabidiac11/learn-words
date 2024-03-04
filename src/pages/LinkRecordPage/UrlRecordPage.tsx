import { ClearRounded } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useState, useCallback } from "react";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { PaginatedWords } from "../../components/PaginatedWords/PaginatedWords";
import { RecordContent } from "../../components/RecordContent/RecordContent";
import { useWordContentFunctions } from "../../core/useWordContentFunctions";
import { useWordFunctions } from "../../core/useWordFunctions";
import { Record } from "../../model.types";
import { UrlRecordForm } from "./UrlRecordForm";
import "./UrlRecordPage.scss";

export const UrlRecordPage = () => {
  const { displayError } = useUIFeedback();
  const { extractWords } = useWordContentFunctions();
  const { addTextRecord, removeRecord } = useWordFunctions();

  const [wordState, setWordState] = useState<{
    words: [string, number][];
    record: Record;
  } | null>(null);

  const onGenerate = useCallback(
    async (name: string, content: string) => {
      try {
        const words = extractWords(content);
        const record = await addTextRecord(name, content);
        setWordState({
          record,
          words,
        });
      } catch (error) {
        console.error(error);
        displayError(error);
      }
    },
    [addTextRecord, displayError, extractWords]
  );

  const onRemoveRecord = useCallback(async () => {
    if (wordState?.record) {
      try {
        await removeRecord(wordState?.record.id);
        setWordState(null);
      } catch (error) {
        console.error(error);
        displayError(error);
      }
    }
  }, [displayError, removeRecord, wordState?.record]);

  return (
    <div className="view page-wrapper url-record-page">
      <div className="view-content">
        {!wordState && <UrlRecordForm submit={onGenerate} />}
        {wordState && (
          <>
            <div className="page-form">
              <Button startIcon={<ClearRounded />} onClick={onRemoveRecord}>
                Delete record
              </Button>
            </div>
            <PaginatedWords words={wordState.words} />
            <RecordContent
              key={wordState.record.id}
              content={wordState.record.content}
            />
          </>
        )}
      </div>
    </div>
  );
};
