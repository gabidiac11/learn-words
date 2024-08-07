import { useCallback, useEffect, useRef, useState } from "react";
import "./RecordContent.scss";
import { Sections } from "./Sections";
import { HightlightMode } from "./contentHightligh";
import { RecordContentHeader } from "./Header";
import { useAppStateContext } from "../../../app-context/useAppState";
import { useUIFeedback } from "../../../app-context/useUIFeedback";
import { ContentSection } from "../../../core/types";
import { extractClassifiedContent } from "../../../core/wordHelpers";
import { useIsElementInView } from "../../../hooks/useIsElementInView";

export const RecordContent = ({ content }: { content: string }) => {
  const { learnedWords } = useAppStateContext();
  const { displayError } = useUIFeedback();
  const firstRender = useRef(true);

  const [changed, setChanged] = useState<boolean>();
  const [sections, setSections] = useState<ContentSection[]>();
  const [hightlightMode, setHightlighMode] = useState<HightlightMode>(
    HightlightMode.Normal
  );

  const refContainer = useRef<HTMLDivElement>(null);
  const refHeader = useRef<HTMLDivElement>(null);
  const isContainerInView = useIsElementInView(refContainer.current);
  const isPagInView = useIsElementInView(refHeader.current);

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
    setHightlighMode(HightlightMode.Normal);
    setChanged(true);
  }, []);

  useEffect(() => {
    setChanged(true);
  }, [learnedWords]);

  useEffect(() => {
    if (firstRender.current) {
      const timeout = setTimeout(() => {
        firstRender.current = false;
        const sections = extractClassifiedContent(content, learnedWords);
        if (sections.length <= 1000) {
          onAddHighlight(sections);
        }
      }, 100);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [content, learnedWords, onAddHighlight]);

  const headerProps = {
    hightlightMode,
    sections,
    changed,
    onChangeHightlighMode: setHightlighMode,
    onAddHighlight,
    onRemoveHighlight,
  };

  return (
    <div className="record-content" ref={refContainer}>
      <div ref={refHeader} className="flex flex-between">
        <div className="content-label mr-15">Content</div>
        <RecordContentHeader {...headerProps} />
      </div>

      <div className="record-content-txt">
        <pre>
          {!!sections && (
            <Sections sections={sections} hightlightMode={hightlightMode} />
          )}
          {!sections && content}
        </pre>
      </div>

      {isContainerInView && !isPagInView && (
        <div className="record-panel-sticky">
          <div className="record-panel-sticky-inner">
            <RecordContentHeader {...headerProps} />
          </div>
        </div>
      )}
    </div>
  );
};
