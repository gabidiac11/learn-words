import { RocketLaunch } from "@mui/icons-material";
import { Textarea } from "@mui/joy";
import { Button } from "@mui/material";
import { useState, useCallback, ChangeEvent } from "react";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { UrlInput } from "./UrlInput";
import Input from "@mui/joy/Input";

export const UrlRecordForm = ({
  submit,
}: {
  submit: (name: string, content: string, source: string) => void;
}) => {
  const { displayError } = useUIFeedback();
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({
    name: false,
    content: false,
  });

  const onUrlInputChange = useCallback(
    async (
      nameUpdate: string,
      contentUpdated: string,
      sourceUpdated: string
    ) => {
      setErrors((p) => ({
        ...p,
        name: false,
        content: false,
      }));
      setName(nameUpdate);
      setContent(contentUpdated);
      setSource(sourceUpdated);
    },
    []
  );

  const onChangeContent = useCallback(async (value: string) => {
    setErrors((p) => ({
      ...p,
      content: false,
    }));
    setContent(value);
  }, []);

  const onChangeName = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    setErrors((p) => ({
      ...p,
      name: false,
    }));
    setName(e.target.value);
  }, []);

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
    submit(name, content, source);
  }, [content, displayError, name, source, submit]);

  return (
    <div className="url-page-form">
      <div className="mt-20">
        <Button
          className="pr-20"
          startIcon={<RocketLaunch />}
          onClick={onSubmit}
        >
          Generate
        </Button>
      </div>

      <div className="mt-20 page-input-container">
        <UrlInput onChange={onUrlInputChange} />
      </div>

      {content && (
        <div className="mt-20 page-input-container">
          <Input
            className="page-input"
            error={errors.name}
            onChange={onChangeName}
            value={name}
            placeholder="Enter name"
          />
        </div>
      )}

      {content && (
        <div className="mt-20 page-input-container">
          <Textarea
            className="mt-15"
            error={errors.content}
            aria-label="minimum height"
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            minRows={5}
            placeholder="Fetched content"
          />
        </div>
      )}
    </div>
  );
};
