import { Input } from "@mui/base";
import { Typography } from "@mui/material";
import { ChangeEvent, useCallback, useState } from "react";
import { useSnackActions } from "../app-context/useSnackActions";
import { AppGenericError } from "../core/types";
import { useFileFunctions } from "../core/useFileFunctions";
import { useWordFunctions } from "../core/useWordFunctions";
import { Record } from "../model.types";
import { getErrorMessage } from "../utils";

export const SrtFilePage = () => {
  const { displayError } = useSnackActions();
  const { extractWords, readFile } = useFileFunctions();
  const { addSrtRecord } = useWordFunctions();

  const [wordState, setWordState] = useState<{
    words: string[];
    content: string;
    record: Record;
  }>();

  const onChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0];
        if (!file) throw new AppGenericError("No file selected.");
        console.log({ file });
        const content = await readFile(file);
        const words = extractWords(content);
        const record = await addSrtRecord(file.name, content);
        setWordState({
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
      <div className="view-content view-items">
        <Input type="file" onChange={onChange} />
        {wordState && (
          <div>
            <div>
              {wordState.words.map((w, i) => (
                <Typography
                  key={i}
                  variant="h6"
                  noWrap
                  tabIndex={0}
                  component="div"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  {w}
                </Typography>
              ))}
            </div>
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
          </div>
        )}
      </div>
    </div>
  );
};
