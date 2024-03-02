import { Button } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useAppStateContext } from "../../app-context/useAppState";
import { ContentSection } from "../../core/types";
import { useWordContentFunctions } from "../../core/useWordContentFunctions";
import "./RecordContent.scss";

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
      <div className="record-panel">
        <Button
          disabled={!changed}
          onClick={() => {
            setSections(extractClassifiedContent(content, learnedWords));
            setChanged(false);
          }}
        >
          Refresh word highlight
        </Button>
      </div>
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
  );
};
