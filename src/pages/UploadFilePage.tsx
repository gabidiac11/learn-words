import { Typography } from "@mui/material";
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
  const { addSrtRecord } = useWordFunctions();

  const [wordState, setWordState] = useState<{
    words: [string, number][];
    fileName: string;
    content: string;
    record: Record;
  }>();

  const onChange = useCallback(
    async (file: File) => {
      try {
        const content = await readFile(file);
        const words = extractWords(content);

        const record = await addSrtRecord(file.name, content);
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
    [addSrtRecord, displayError, extractWords, readFile]
  );

  return (
    <div className="view page-wrapper">
      <div className="view-content">
        <FileInput onChange={onChange} />
        {wordState && <PaginatedWords words={wordState.words} />}
        {wordState && (
          <div>
            <Typography
              variant="caption"
              noWrap
              tabIndex={0}
              component="div"
              sx={{
                display: { xs: "none", sm: "block" },
                "white-space": "break-spaces",
              }}
            >
              {wordState.content}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
