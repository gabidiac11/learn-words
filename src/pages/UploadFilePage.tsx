import { useCallback, useState } from "react";
import { useUIFeedback } from "../app-context/useUIFeedback";
import { useFileFunctions } from "../core/useFileFunctions";
import { useWordFunctions } from "../core/useWordFunctions";
import { Record } from "../model.types";
import { getErrorMessage } from "../utils";
import { PaginatedWords } from "../components/PaginatedWords/PaginatedWords";
import { FileInput } from "../components/FileInput";

export const UploadFilePage = () => {
  const { displayError } = useUIFeedback();
  const { extractWords, readFile } = useFileFunctions();
  const { addFileRecord, removeRecord } = useWordFunctions();

  const [wordState, setWordState] = useState<{
    words: [string, number][];
    fileName: string;
    content: string;
    record: Record;
  } | null>(null);

  const onChange = useCallback(
    async (file: File) => {
      try {
        const content = await readFile(file);
        const words = extractWords(content);

        const record = await addFileRecord(file.name, content);
        setWordState({
          fileName: file.name,
          content,
          record,
          words,
        });
      } catch (error) {
        console.error(error);
        displayError(getErrorMessage(error));
      }
    },
    [addFileRecord, displayError, extractWords, readFile]
  );

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

  return (
    <div className="view page-wrapper">
      <div className="view-content">
        <FileInput onChange={onChange} onRemove={onRemoveRecord} />
        {wordState && <PaginatedWords words={wordState.words} />}
        {wordState && (
          <div
            style={{
              padding: "20px",
              maxWidth: "calc(100vw - calc(var(--page-padding-h) * 2))",
              overflowX: "auto",
              border: "1px solid rgba(0,0,0,0.2)",
            }}
          >
            <pre>{wordState.content}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
