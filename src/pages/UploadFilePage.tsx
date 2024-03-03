import { useCallback, useState } from "react";
import { useUIFeedback } from "../app-context/useUIFeedback";
import { useWordContentFunctions } from "../core/useWordContentFunctions";
import { useWordFunctions } from "../core/useWordFunctions";
import { Record } from "../model.types";
import { PaginatedWords } from "../components/PaginatedWords/PaginatedWords";
import { AppFileInput } from "../components/AppFileInput";
import { RecordContent } from "../components/RecordContent/RecordContent";
import { Extensions } from "../core/types";

const allowedExtensions = [Extensions.Srt, Extensions.Txt];

export const UploadFilePage = () => {
  const { displayError } = useUIFeedback();
  const { extractWords, readFile } = useWordContentFunctions();
  const { addTextRecord, removeRecord } = useWordFunctions();

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
        const record = await addTextRecord(file.name, content);
        setWordState({
          fileName: file.name,
          content,
          record,
          words,
        });
      } catch (error) {
        console.error(error);
        displayError(error);
      }
    },
    [addTextRecord, displayError, extractWords, readFile]
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
        <AppFileInput
          allowedExtensions={allowedExtensions}
          disabled={!!wordState}
          onChange={onChange}
          onRemove={onRemoveRecord}
        />
        {wordState && <PaginatedWords words={wordState.words} />}
        {wordState && (
          <RecordContent
            key={wordState.record.id}
            content={wordState.content}
          />
        )}
      </div>
    </div>
  );
};
