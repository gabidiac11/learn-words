import { ChangeEvent, useCallback, useState } from "react";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { useWordFunctions } from "../../core/useWordFunctions";
import { Input, Textarea } from "@mui/joy";
import { Button } from "@mui/material";
import { RocketLaunch } from "@mui/icons-material";
import { PasteButton } from "../../components/PasteButton";
import { useNavigate } from "react-router-dom";

import "./AddRecord.scss";
import { SourceOptions } from "./SourceOptions";

export const AddRecordTextPage = () => {
  const { displayError } = useUIFeedback();
  const { addRecord } = useWordFunctions();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [source, setSource] = useState<string>();
  const [errors, setErrors] = useState({
    name: false,
    content: false,
  });

  const onGenerate = useCallback(
    async (name: string, content: string) => {
      try {
        const record = await addRecord(name, content, source);
        navigate(`/records/${record.id}`, { state: record });
      } catch (error) {
        console.error(error);
        displayError(error);
      }
    },
    [addRecord, displayError, navigate, source]
  );

  const onChangeContent = useCallback(
    async (e: ChangeEvent<HTMLTextAreaElement>) => {
      setErrors((p) => ({
        ...p,
        content: false,
      }));
      setContent(e.target.value);
    },
    []
  );

  const onChangeName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setErrors((p) => ({
      ...p,
      name: false,
    }));
    setName(e.target.value);
  }, []);

  const onPaste = useCallback(
    (value: string) => {
      setContent(value);
      if (!value) {
        setErrors((p) => ({ ...p, content: false }));
        return;
      }

      if (!name) {
        setName(value.slice(0, 20));
        setErrors({ name: false, content: false });
      } else {
        setErrors((p) => ({ ...p, content: false }));
      }
    },
    [name]
  );

  const onSubmit = useCallback(() => {
    setErrors({
      name: !name,
      content: !content,
    });
    if (!content) {
      displayError("Content is required.");
      return;
    }
    if (!name) {
      displayError("Name is required.");
      return;
    }
    onGenerate(name, content);
  }, [content, displayError, name, onGenerate]);

  return (
    <div className="view page-wrapper add-record-page">
      <div className="view-content">
        <div className="page-form">
          <div className="pb-10">
            <Button
              className="pr-20"
              startIcon={<RocketLaunch />}
              onClick={onSubmit}
            >
              Generate
            </Button>
            <PasteButton onChange={onPaste}>Paste</PasteButton>
          </div>

          <Input
            className="mb-15"
            error={errors.name}
            onChange={onChangeName}
            value={name}
            placeholder="Enter name"
          />

          <SourceOptions className="mb-15" urlValue={source} setUrlValue={setSource} />

          <Textarea
            error={errors.content}
            aria-label="minimum height"
            value={content}
            onChange={onChangeContent}
            minRows={5}
            placeholder="Enter content..."
          />
        </div>
      </div>
    </div>
  );
};
