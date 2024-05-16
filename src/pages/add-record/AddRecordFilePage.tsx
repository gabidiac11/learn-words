import { ChangeEvent, useCallback, useState } from "react";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { useWordFunctions } from "../../core/useWordFunctions";
import { AppFileInput } from "../../components/AppFileInput";
import { AppGenericError, Extensions } from "../../core/types";
import { Button as ButtonMat } from "@mui/material";
import { readFile } from "../../core/wordHelpers";
import { useNavigate } from "react-router-dom";
import { RocketLaunch } from "@mui/icons-material";
import { Input, Textarea } from "@mui/joy";
import { SourceOptions } from "./SourceOptions";

import "./AddRecord.scss";

const allowedExtensions = [Extensions.Srt, Extensions.Txt];

export const AddRecordFilePage = () => {
  const { displayError } = useUIFeedback();
  const { addRecord } = useWordFunctions();
  const navigate = useNavigate();

  const [wordState, setWordState] = useState<{
    fileName: string;
    name: string;
    content: string;
    source?: string;
  } | null>(null);

  const [errors, setErrors] = useState({
    name: false,
    content: false,
  });

  const onChangeUrlValue = useCallback((source: string) => {
    setWordState((w) => {
      if (!w) throw new Error();
      return { ...w, source };
    });
  }, []);

  const onGenerate = useCallback(async () => {
    try {
      setErrors({
        content: !wordState,
        name: !wordState?.name,
      });

      if (!wordState) throw new AppGenericError("File not selected.");
      if (!wordState.name) throw new AppGenericError("Empty name.");

      const record = await addRecord(wordState.name, wordState.content, wordState.source);
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
        setErrors((p) => ({
          ...p,
          name: false,
        }));
        setWordState({
          fileName: file.name,
          name: file.name,
          content,
        });
      } catch (error) {
        console.error(error);
        displayError(error);
      }
    },
    [displayError]
  );

  const onRemoveRecord = useCallback(async () => {
    setWordState(null);
  }, []);

  const onChangeName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!wordState) {
        displayError("File not selected.");
        return;
      }
      setErrors((p) => ({
        ...p,
        name: false,
      }));
      setWordState({ ...wordState, name: e.target.value });
    },
    [displayError, wordState]
  );

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
            <Input
              error={errors.name}
              onChange={onChangeName}
              value={wordState.name}
              placeholder="Enter name"
            />
          </div>
        )}

        {wordState && (
          <div className="mb-20 page-input-container">
            <SourceOptions
              urlValue={wordState.source}
              setUrlValue={onChangeUrlValue}
            />
          </div>
        )}

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
