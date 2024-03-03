import { ChangeEvent, useCallback, useState } from "react";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { useWordContentFunctions } from "../../core/useWordContentFunctions";
import { useWordFunctions } from "../../core/useWordFunctions";
import { Record } from "../../model.types";
import { getErrorMessage } from "../../utils";
import { PaginatedWords } from "../../components/PaginatedWords/PaginatedWords";
import { RecordContent } from "../../components/RecordContent/RecordContent";
import { Textarea } from "@mui/joy";
import { Button } from "@mui/material";
import { ClearRounded, ContentPaste } from "@mui/icons-material";

export const TextPage = () => {
  const { displayError } = useUIFeedback();
  const { extractWords } = useWordContentFunctions();
  const { addTextRecord, removeRecord } = useWordFunctions();

  const [wordState, setWordState] = useState<{
    words: [string, number][];
    record: Record;
  } | null>(null);

  const [value, setValue] = useState("");

  const onChange = useCallback(async (e:ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, []);

  const onGenerate = useCallback(async () => {
    try {
      const words = extractWords(value);
      const record = await addTextRecord(
        `${value.slice(0, 10)}${value.length > 10 ? "..." : ""}`,
        value
      );
      setWordState({
        record,
        words,
      });
    } catch (error) {
      console.error(error);
      displayError(getErrorMessage(error));
    }
  }, [addTextRecord, displayError, extractWords, value]);

  const onRemoveRecord = useCallback(async () => {
    if (wordState?.record) {
      try {
        await removeRecord(wordState?.record.id);
        setWordState(null);
      } catch (error) {
        console.error(error);
        displayError(getErrorMessage(error));
      }
    }
  }, [displayError, removeRecord, wordState?.record]);

  const copyFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setValue(text);
    } catch (err) {
      console.error("Failed to read clipboard contents:", err);
      displayError("Failed to read clipboard contents");
    }
  }, [displayError]);

  return (
    <div className="view page-wrapper">
      <div className="view-content">
        {!wordState && (
          <div className="page-form">
            <Button onClick={onGenerate}>Generate</Button>
            <Button startIcon={<ContentPaste />} onClick={copyFromClipboard}>
              Paste
            </Button>
            <Textarea
              aria-label="minimum height"
              value={value}
              onChange={onChange}
              minRows={5}
              placeholder="Enter content..."
            />
            {/* TODO: add name input */}
          </div>
        )}
        {wordState && (
          <div className="page-form">
            <Button startIcon={<ClearRounded />} onClick={onRemoveRecord}>
              Delete record
            </Button>
          </div>
        )}
        {wordState && <PaginatedWords words={wordState.words} />}
        {wordState && (
          <RecordContent key={wordState.record.id} content={value} />
        )}
      </div>
    </div>
  );
};
