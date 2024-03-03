import { Button } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useAppStateContext } from "../../app-context/useAppState";
import { ContentSection } from "../../core/types";
import { useWordContentFunctions } from "../../core/useWordContentFunctions";
import HighlightIcon from "@mui/icons-material/Highlight";
import RefreshIcon from "@mui/icons-material/Refresh";
import "./RecordContent.scss";
import { ClearRounded } from "@mui/icons-material";

export const RecordContent = ({ content }: { content: string }) => {
  const { extractClassifiedContent } = useWordContentFunctions();
  const { learnedWords } = useAppStateContext();
  const [changed, setChanged] = useState<boolean>(true);
  const [sections, setSections] = useState<ContentSection[]>();

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
            variant="contained"
            disabled={!changed}
            onClick={() => {
              setSections(extractClassifiedContent(content, learnedWords));
              setChanged(false);
            }}
            startIcon={!sections ? <HighlightIcon /> : <RefreshIcon />}
          >
            {!sections && "Add highlight"}
            {!!sections && "Refresh highlight"}
          </Button>
          {!!sections && (
            <Button
              variant="contained"
              onClick={() => {
                setSections(undefined);
                setChanged(true);
              }}
              startIcon={<ClearRounded />}
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
