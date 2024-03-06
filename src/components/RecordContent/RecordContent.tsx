import { Button } from "@mui/joy";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useAppStateContext } from "../../app-context/useAppState";
import { ContentSection } from "../../core/types";
import { useWordContentFunctions } from "../../core/word-content/useWordContentFunctions";
import HighlightIcon from "@mui/icons-material/Highlight";
import RefreshIcon from "@mui/icons-material/Refresh";
import "./RecordContent.scss";
import { ClearRounded } from "@mui/icons-material";
import { useUIFeedback } from "../../app-context/useUIFeedback";

export const RecordContent = ({ content }: { content: string }) => {
  const { extractClassifiedContent } = useWordContentFunctions();
  const { learnedWords } = useAppStateContext();
  const { displayError } = useUIFeedback();

  const [changed, setChanged] = useState<boolean>(true);
  const [sections, setSections] = useState<ContentSection[]>();

  const onAddHighlight = useCallback(async () => {
    try {
      setSections(extractClassifiedContent(content, learnedWords));
      setChanged(false);
    } catch (error) {
      console.error(error);
      displayError(error);
      setChanged(true);
    }
  }, [content, displayError, extractClassifiedContent, learnedWords]);

  const onRemoveHighlight = useCallback(() => {
    setSections(undefined);
    setChanged(true);
  }, []);

  useEffect(() => {
    setChanged(true);
  }, [learnedWords]);

  return (
    <div className="record-content">
      <div className="record-panel mb-15">
        <div className="content-label mr-15">Content</div>
        <div className="flex">
          <Button
            className="mr-15"
            variant="solid"
            disabled={!changed}
            onClick={onAddHighlight}
            startDecorator={!sections ? <HighlightIcon /> : <RefreshIcon />}
          >
            {!sections && "Add highlight"}
            {!!sections && "Refresh highlight"}
          </Button>
          {!!sections && (
            <Button
              variant="solid"
              onClick={onRemoveHighlight}
              startDecorator={<ClearRounded />}
            >
              Remove highlight
            </Button>
          )}
        </div>
      </div>
      <div className="record-content-txt">
        <pre>
          {!!sections &&
            sections.map((section, i) => {
              if (section.isLearned) {
                return (
                  <Fragment key={i}>
                    <span>{section.content}</span>
                  </Fragment>
                );
              }
              return (
                <Fragment key={i}>
                  <span style={{ color: "red" }}>{section.content}</span>
                </Fragment>
              );
            })}
          {!sections && content}
        </pre>
      </div>
    </div>
  );
};
