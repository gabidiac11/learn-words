import { useCallback, useEffect, useState } from "react";
import { useAppStateContext } from "../../../app-context/useAppState";
import { useUIFeedback } from "../../../app-context/useUIFeedback";
import { ContentSection } from "../../../core/types";
import { useWordFunctions } from "../../../core/useWordFunctions";
import {
  AppEvent,
  AppEventType,
  useAppEvents,
} from "../../../hooks/useAppEvents";
import { HightlightMode } from "./contentHightligh";

export const Sections = ({
  sections,
  hightlightMode,
}: {
  sections: ContentSection[];
  hightlightMode: HightlightMode;
}) => {
  const { displayError } = useUIFeedback();
  const { learnedWords } = useAppStateContext();
  const { addLearnedWord, removeLearnedWord } = useWordFunctions();
  const { addListener, removeListener, emitWordLearningChange } =
    useAppEvents();

  const [added, setAdded] = useState<{ [key: string]: boolean }>({});

  const onToggleLearnedWords = useCallback(
    (word: string) => {
      try {
        const id = learnedWords[word];
        setAdded((p) => ({ ...p, [word]: !id }));
        emitWordLearningChange(word, !id);

        if (id) {
          removeLearnedWord(word, id);
        } else {
          addLearnedWord(word);
        }
      } catch (error) {
        displayError(error);
      }
    },
    [
      addLearnedWord,
      displayError,
      emitWordLearningChange,
      learnedWords,
      removeLearnedWord,
    ]
  );

  useEffect(() => {
    const handler = ({ detail: { word, learned } }: AppEvent) => {
      setAdded((p) => ({ ...p, [word]: learned }));
    };

    addListener(AppEventType.WordLearningChange, handler);
    return () => {
      removeListener(AppEventType.WordLearningChange, handler);
    };
  }, [addListener, removeListener]);

  return (
    <>
      {sections.map((section, i) => {
        if (hightlightMode === HightlightMode.Add && !section.isLearned) {
          return (
            <AddModeSection
              content={section.content}
              added={added[section.content.toLocaleLowerCase()]}
              onClick={() =>
                onToggleLearnedWords(section.content.toLowerCase())
              }
            />
          );
        }
        return (
          <Section key={i} section={section} hightlightMode={hightlightMode} />
        );
      })}
    </>
  );
};

const Section = ({
  section,
  hightlightMode,
}: {
  section: ContentSection;
  hightlightMode: HightlightMode;
}) => {
  if (section.isLearned) {
    return <span className="txt-content">{section.content}</span>;
  }
  if (hightlightMode === HightlightMode.TranslateLink) {
    return (
      <span>
        <a
          tabIndex={0}
          className="no-anchor txt-content txt-unknwon"
          href={section.translateUrl}
          target="_blank"
          rel="noreferrer"
        >
          {section.content}
        </a>
      </span>
    );
  }
  return <span tabIndex={0} className="txt-content txt-unknwon">{section.content}</span>;
};

const AddModeSection = ({
  content,
  onClick,
  added,
}: {
  content: string;
  onClick: () => void;
  added: boolean | undefined;
}) => {
  return (
    <span
      tabIndex={0}
      onClick={onClick}
      className={`txt-content txt-editable txt-unknwon ${
        added === true ? "txt-learned" : ""
      }`}
    >
      {content}
    </span>
  );
};
