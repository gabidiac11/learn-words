import {
  Box,
  Checkbox,
  FormControlLabel,
  SelectChangeEvent,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { useRefState } from "../../hooks/useRefState";
import "./PaginatedWords.scss";
import AppSelect from "../AppSelect";
import { uuidv4 } from "@firebase/util";
import { useAppStateContext } from "../../app-context/useAppState";
import { useWordFunctions } from "../../core/useWordFunctions";
import { getErrorMessage } from "../../utils";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { StarBorder, Star, Check as CheckIcon } from "@mui/icons-material";
import { Words } from "../../app-context/types";

const pageOptions = [20, 50, 100, 150, 200, 250, 500, 1000, 1200, 1500].map(
  (value) => ({ value })
);

export const PaginatedWords = ({ words }: { words: [string, number][] }) => {
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    key: uuidv4(),
  });
  const { learnedWords, wordsToLearn } = useAppStateContext();
  const {
    addLearnedWord,
    removeLearnedWord,
    addWordToLearningList,
    removeWordFromLearningList,
  } = useWordFunctions();
  const { displayError } = useUIFeedback();

  const [isFocused, setIsFocused] = useRefState<boolean>(false);
  const refContainer = useRef<HTMLDivElement>(null);
  const [showLearned, setShowLearned] = useState(false);
  const [sessionLearned, setSessionLearned] = useState<Words>({});

  const [numOfLearned, numOfUnknown] = useMemo(
    () =>
      words.reduce(
        (values, [w]) => {
          if (learnedWords[w]) {
            values[0] += 1;
          } else {
            values[1] += 1;
          }
          return values;
        },
        [0, 0]
      ),
    [learnedWords, words]
  );

  const startIndex = useMemo(
    () => (pagination.page - 1) * pagination.pageSize,
    [pagination.page, pagination.pageSize]
  );
  const endIndex = useMemo(
    () => pagination.page * pagination.pageSize - 1,
    [pagination.page, pagination.pageSize]
  );

  const filteredWords = useMemo(
    () =>
      showLearned
        ? words
        : words.filter(([w]) => !learnedWords[w] || sessionLearned[w]),
    [learnedWords, sessionLearned, showLearned, words]
  );

  const numOfPages = useMemo(() => {
    return Math.ceil(filteredWords.length / pagination.pageSize);
  }, [filteredWords.length, pagination.pageSize]);

  console.log({ startIndex, endIndex, numOfPages });

  const onToggleLearnedWords = useCallback(
    async (word: string) => {
      try {
        const id = learnedWords[word];
        if (id) {
          removeLearnedWord(word, id);
        } else {
          const addedWordId = await addLearnedWord(word);
          setSessionLearned((prev) => ({ ...prev, [word]: addedWordId }));
        }
      } catch (error) {
        displayError(getErrorMessage(error));
      }
    },
    [addLearnedWord, displayError, learnedWords, removeLearnedWord]
  );

  const onToggleWordsToLearn = useCallback(
    (word: string) => {
      try {
        const id = wordsToLearn[word];
        if (id) {
          removeWordFromLearningList(word, id);
        } else {
          addWordToLearningList(word);
        }
      } catch (error) {
        displayError(getErrorMessage(error));
      }
    },
    [
      wordsToLearn,
      removeWordFromLearningList,
      addWordToLearningList,
      displayError,
    ]
  );

  const onChangeDisplayLearned = useCallback(
    (e: unknown, checked: boolean) => {
      setPagination({
        page: 1,
        pageSize: pagination.pageSize,
        key: uuidv4(),
      });
      setSessionLearned({});
      setShowLearned(checked);
    },
    [pagination.pageSize]
  );

  const onChangePageSize = useCallback((e: SelectChangeEvent<string>) => {
    const count = Number(e.target.value);
    setPagination({
      pageSize: count,
      key: uuidv4(),
      page: 1,
    });
    setSessionLearned({});
  }, []);

  const onChangePage = useCallback(
    (e: React.ChangeEvent<unknown>, page: number) => {
      setPagination((prev) => ({ ...prev, page }));
    },
    []
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      setIsFocused(
        !!e.target &&
          (refContainer.current === e.target ||
            (refContainer.current?.contains(
              e.target as unknown as HTMLElement
            ) ??
              false))
      );
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [setIsFocused]);

  useEffect(() => {
    const onArrows = (e: KeyboardEvent) => {
      if (!isFocused) {
        return;
      }
      if (e.key === "ArrowRight" && pagination.page + 1 <= numOfPages) {
        setPagination({ ...pagination, page: pagination.page + 1 });
      } else if (e.key === "ArrowLeft" && pagination.page - 1 > 0) {
        setPagination({ ...pagination, page: pagination.page - 1 });
      }
    };
    window.addEventListener("keydown", onArrows);
    return () => {
      window.removeEventListener("keydown", onArrows);
    };
  }, [isFocused, numOfPages, pagination]);

  useEffect(() => {
    setPagination((prev) => ({
      page: 1,
      pageSize: prev.pageSize,
      key: uuidv4(),
    }));
  }, [words]);

  // TODO: make filters and pagination sticky while this is into view
  // TODO: get a ux friendly way to add words to learn list (global) or on the record level
  // TODO: implement swipe left-right

  return (
    <div
      className={`paginated-words ${isFocused ? "is-focused" : ""}`}
      ref={refContainer}
    >
      <div className="word-list-header flex-row flex-align-center">
        <AppSelect
          label="Page size"
          value={pagination.pageSize}
          handleChange={onChangePageSize}
          options={pageOptions}
        />
        <Pagination
          key={pagination.key}
          count={numOfPages}
          siblingCount={0}
          boundaryCount={1}
          page={pagination.page}
          onChange={onChangePage}
        />
        <Box>
          Total: {words.length} | Learned: {numOfLearned} | Unknown:{" "}
          {numOfUnknown}{" "}
        </Box>
        <FormControlLabel
          className="checkbox-display-learned"
          defaultChecked={showLearned}
          onChange={onChangeDisplayLearned}
          control={<Checkbox />}
          label="Display learned words"
        />
      </div>
      <div className="word-items">
        {filteredWords.map(([w, count], i) => {
          if (!(i >= startIndex && i <= endIndex)) {
            return null;
          }
          const isLearned = !!learnedWords[w];
          const isAddedToLearningList = !!wordsToLearn[w];
          return (
            <div className="word-item-container" key={w}>
              <div className="word-item">
                <div
                  className="word-square"
                  onClick={() => onToggleLearnedWords(w)}
                  title={
                    isLearned
                      ? `You don't know what '${w}' means? Click here to unmark.`
                      : `You actually know what '${w}' means? Click here to mark.`
                  }
                >
                  <div className="word-typography flex-center-all" tabIndex={0}>
                    <div style={{ opacity: isLearned ? 0.2 : 1 }}>
                      {count}: {w}
                    </div>
                    <div
                      style={{ paddingLeft: "0.5rem" }}
                      className={`flex-center-all btn-action flex-center-all ${
                        isLearned ? "btn-active" : ""
                      }`}
                    >
                      <CheckIcon />
                    </div>
                  </div>
                </div>
                <button
                  className={`btn-action btn-word-add flex-center-all ${
                    isAddedToLearningList ? "btn-active" : ""
                  }`}
                  title={
                    isAddedToLearningList
                      ? `Click here to remove '${w}' from learning list.`
                      : `Click here to add '${w}' from learning list.`
                  }
                  onClick={() => onToggleWordsToLearn(w)}
                >
                  {isAddedToLearningList ? <Star /> : <StarBorder />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
