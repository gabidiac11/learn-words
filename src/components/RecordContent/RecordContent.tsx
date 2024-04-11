import { Button } from "@mui/joy";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useAppStateContext } from "../../app-context/useAppState";
import { ContentSection } from "../../core/types";
import HighlightIcon from "@mui/icons-material/Highlight";
import RefreshIcon from "@mui/icons-material/Refresh";
import "./RecordContent.scss";
import { ClearRounded, Translate } from "@mui/icons-material";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { extractClassifiedContent } from "../../core/wordHelpers";

export const RecordContent = ({ content }: { content: string }) => {
  const { learnedWords } = useAppStateContext();
  const { displayError } = useUIFeedback();
  const firstRender = useRef(true);

  const [changed, setChanged] = useState<boolean>();
  const [sections, setSections] = useState<ContentSection[]>();
  const [translateLinks, setTranslateLinks] = useState(false);

  const onAddHighlight = useCallback(
    async (sectionsMaybe?: ContentSection[]) => {
      try {
        setSections(
          sectionsMaybe ?? extractClassifiedContent(content, learnedWords)
        );
        setChanged(false);
      } catch (error) {
        console.error(error);
        displayError(error);
        setChanged(true);
      }
    },
    [content, displayError, learnedWords]
  );

  const onRemoveHighlight = useCallback(() => {
    setSections(undefined);
    setChanged(true);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      const sections = extractClassifiedContent(content, learnedWords);
      if (sections.length <= 1000) {
        onAddHighlight(sections);
      }
    }
  }, [content, learnedWords, onAddHighlight]);

  useEffect(() => {
    setChanged(true);
  }, [learnedWords]);

  return (
    <div className="record-content">
      <div className="record-panel mb-15">
        <div className="content-label mr-15">Content</div>
        <div className="flex flex-wrap">
        {!!sections && (
            <Button
              variant="solid"
              className="mr-15 mb-5"
              color={!translateLinks ? "neutral" : undefined}
              onClick={() => setTranslateLinks((t) => !t)}
            >
              <Translate />
            </Button>
          )}
          <Button
            className="mr-15 mb-5"
            variant="solid"
            disabled={!changed}
            onClick={() => onAddHighlight()}
            startDecorator={!sections ? <HighlightIcon /> : <RefreshIcon />}
          >
            {!sections && "Add"}
            {!!sections && "Refresh"}
          </Button>
          {!!sections && (
            <Button
              className="mr-15 mb-5"
              variant="solid"
              onClick={onRemoveHighlight}
              startDecorator={<ClearRounded />}
            >
              Remove color
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
              if (!translateLinks) {
                return (
                  <Fragment key={i}>
                    <span className="txt-unknwon">{section.content}</span>
                  </Fragment>
                );
              }
              return (
                <Fragment key={i}>
                  <span>
                    <a
                      className="no-anchor txt-unknwon"
                      href={section.translateUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {section.content}
                    </a>
                  </span>
                </Fragment>
              );
            })}
          {!sections && content}
        </pre>
      </div>
    </div>
  );
};
