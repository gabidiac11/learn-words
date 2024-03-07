import { useCallback, useState } from "react";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { useWordFunctions } from "../../core/useWordFunctions";
import { LearningRecord } from "../../model.types";
import { AppFileInput } from "../../components/AppFileInput";
import { AppGenericError, Extensions } from "../../core/types";
import { Button as ButtonMat } from "@mui/material";
import { readFile } from "../../core/word-content/contentFunctions";
import { useNavigate } from "react-router-dom";
import { RocketLaunch } from "@mui/icons-material";

import "./AddRecord.scss";
import { Textarea } from "@mui/joy";

const allowedExtensions = [Extensions.Srt, Extensions.Txt];

export const AddRecordFilePage = () => {
  const { displayError } = useUIFeedback();
  const { addRecord } = useWordFunctions();
  const navigate = useNavigate();

  const [wordState, setWordState] = useState<{
    fileName: string;
    content: string;
    record: LearningRecord;
  } | null>(null);

  const onGenerate = useCallback(async () => {
    try {
      if (!wordState) throw new AppGenericError("File not selected.");

      const record = await addRecord(wordState.fileName, wordState.content);
      navigate(`/records/${record.id}`, { state: record });
    } catch (error) {
      console.error(error);
      displayError(error);
    }
  }, [addRecord, displayError, navigate, wordState]);

  const onChange = useCallback(
    async (file: File) => {
      try {
        const content = await readFile(file);
        const record = await addRecord(file.name, content);
        setWordState({
          fileName: file.name,
          content,
          record,
        });
      } catch (error) {
        console.error(error);
        displayError(error);
      }
    },
    [addRecord, displayError]
  );

  const onRemoveRecord = useCallback(async () => {
    if (wordState?.record) {
      try {
        setWordState(null);
      } catch (error) {
        console.error(error);
        displayError(error);
      }
    }
  }, [displayError, wordState?.record]);

  return (
    <div className="view page-wrapper add-record-page">
      <div className="view-content">
        <div className="mb-20">
          <ButtonMat
            className="pr-20"
            disabled={!wordState}
            startIcon={<RocketLaunch />}
            onClick={onGenerate}
          >
            Generate
          </ButtonMat>
        </div>

        <div className="mb-20">
          <AppFileInput
            allowedExtensions={allowedExtensions}
            disabled={!!wordState}
            onChange={onChange}
            onRemove={onRemoveRecord}
          />
        </div>

        {wordState && (
          <div className="mb-20 page-input-container">
            <Textarea
              className="mt-15"
              aria-label="minimum height"
              value={wordState.content}
              readOnly={true}
              minRows={5}
              placeholder="Fetched content"
            />
          </div>
        )}
      </div>
    </div>
  );
};
