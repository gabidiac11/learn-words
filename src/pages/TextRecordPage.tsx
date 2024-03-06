import { ChangeEvent, useCallback, useState } from "react";
import { useUIFeedback } from "../app-context/useUIFeedback";
import { useWordContentFunctions } from "../core/word-content/useWordContentFunctions";
import { useWordFunctions } from "../core/useWordFunctions";
import { Record } from "../model.types";
import { PaginatedWords } from "../components/PaginatedWords/PaginatedWords";
import { RecordContent } from "../components/RecordContent/RecordContent";
import { Input, Textarea } from "@mui/joy";
import { Button } from "@mui/material";
import { ClearRounded, RocketLaunch } from "@mui/icons-material";
import { PasteButton } from "../components/PasteButton";

export const TextRecordPage = () => {
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
    <div className="view page-wrapper">
      <div className="view-content">
        {!wordState && <TextRecordForm submit={onGenerate} />}
        {wordState && (
          <>
            <div className="page-form">
              <h3>{wordState.record.name}</h3>
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

const TextRecordForm = ({
  submit,
}: {
  submit: (name: string, content: string) => void;
}) => {
  const { displayError } = useUIFeedback();
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({
    name: false,
    content: false,
  });

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
    submit(name, content);
  }, [content, displayError, name, submit]);

  return (
    <div className="page-form">
      <div className="pb-10">
        <Button
          className="pr-20"
          startIcon={<RocketLaunch />}
          onClick={onSubmit}
        >
          Generate
        </Button>
        <PasteButton onChange={(value) => setContent(value)} />
      </div>

      <Textarea
        className="mb-15"
        error={errors.content}
        aria-label="minimum height"
        value={content}
        onChange={onChangeContent}
        minRows={5}
        placeholder="Enter content..."
      />

      <Input
        error={errors.name}
        onChange={onChangeName}
        value={name}
        placeholder="Enter name"
      />
    </div>
  );
};
