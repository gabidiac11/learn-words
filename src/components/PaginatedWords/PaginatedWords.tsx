import {
  Box,
  Checkbox,
  FormControlLabel,
  SelectChangeEvent,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Pagination, { PaginationProps } from "@mui/material/Pagination";
import "./PaginatedWords.scss";
import AppSelect from "../AppSelect";
import { uuidv4 } from "@firebase/util";
import { useAppStateContext } from "../../app-context/useAppState";
import { useWordFunctions } from "../../core/useWordFunctions";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { StarBorder, Star, Check as CheckIcon } from "@mui/icons-material";
import { useIsElementInView } from "../../hooks/useIsElementInView";
import { useIsElementFocused } from "../../hooks/useIsElementFocused";

const pageOptions = [
  25, 50, 100, 150, 200, 250, 500, 1000, 1200, 1500, 1750, 2000, 2250, 2500,
].map((value) => ({ value }));

export const PaginatedWords = ({ words }: { words: [string, number][] }) => {
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 100,
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

  const refContainer = useRef<HTMLDivElement>(null);
  const isContainerInView = useIsElementInView(refContainer.current);
  const refPagination = useRef<HTMLDivElement>(null);
  const isPagInView = useIsElementInView(refPagination.current);

  const isFocused = useIsElementFocused(refContainer.current);
  const [showLearned, setShowLearned] = useState(false);
  const [showToLearnOnly, setShowToLearnOnly] = useState(false);

  // prevent items disapearing from the list if filter is applied untill pagination is reseted by the user
  const [sessionWords, setSessionWords] = useState<{ [word: string]: true }>(
    {}
  );

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

  const filteredWords = useMemo(() => {
    if (showLearned === true && showToLearnOnly === false) {
      return words;
    }

    const satisfiesShowLearnOnly = showToLearnOnly
      ? (w: string) => !!wordsToLearn[w]
      : () => true;
    const satisfiesShowToLearn = showLearned
      ? () => true
      : (w: string) => !learnedWords[w];

    return words.filter(
      ([w]) =>
        sessionWords[w] ||
        (satisfiesShowLearnOnly(w) && satisfiesShowToLearn(w))
    );
  }, [
    learnedWords,
    sessionWords,
    showLearned,
    showToLearnOnly,
    words,
    wordsToLearn,
  ]);

  const numOfPages = useMemo(() => {
    return Math.ceil(filteredWords.length / pagination.pageSize);
  }, [filteredWords.length, pagination.pageSize]);

  const onToggleLearnedWords = useCallback(
    (word: string) => {
      try {
        const id = learnedWords[word];
        if (id) {
          removeLearnedWord(word, id);
        } else {
          addLearnedWord(word);
          setSessionWords((prev) => ({ ...prev, [word]: true }));
        }
      } catch (error) {
        displayError(error);
      }
    },
    [addLearnedWord, displayError, learnedWords, removeLearnedWord]
  );

  const onToggleWordsToLearn = useCallback(
    (word: string) => {
      try {
        const id = wordsToLearn[word];
        setSessionWords((prev) => ({ ...prev, [word]: true }));
        if (id) {
          removeWordFromLearningList(word, id);
        } else {
          addWordToLearningList(word);
        }
      } catch (error) {
        displayError(error);
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
      setSessionWords({});
      setShowLearned(checked);
    },
    [pagination.pageSize]
  );

  const onChangeDisplayToLearn = useCallback(
    (e: unknown, checked: boolean) => {
      setPagination({
        page: 1,
        pageSize: pagination.pageSize,
        key: uuidv4(),
      });
      setSessionWords({});
      setShowToLearnOnly(checked);
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
    setSessionWords({});
  }, []);

  const onChangePage = useCallback(
    (e: React.ChangeEvent<unknown>, page: number) => {
      setPagination((prev) => ({ ...prev, page }));
    },
    []
  );

  const scrollToThis = useCallback(() => {
    window.scrEl().scrollTo({
      behavior: "smooth",
      top:
        (refContainer.current?.getBoundingClientRect().top ??
          -window.scrEl().scrollTop) +
        window.scrEl().scrollTop -
        10,
    });
  }, []);

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

  useEffect(() => {
    scrollToThis();
  }, [scrollToThis]);

  const paginationProps: PaginationProps = {
    size: "large",
    className: "pagination",
    count: numOfPages,
    siblingCount: 0,
    boundaryCount: 1,
    page: pagination.page,
    onChange: onChangePage,
  };

  return (
    <div className="paginated-words" ref={refContainer}>
      <div className="flex-row flex-align-center word-list-header">
        <Box className="totals-info">
          Total: {words.length} | Learned: {numOfLearned} | Unknown:{" "}
          {numOfUnknown}{" "}
        </Box>
      </div>
      <div className="word-header-pagination">
        <AppSelect
          className="pagination-size"
          label="Page size"
          value={pagination.pageSize}
          handleChange={onChangePageSize}
          options={pageOptions}
        />
        <FormControlLabel
          className="word-filter-checkbox"
          defaultChecked={showLearned}
          onChange={onChangeDisplayLearned}
          control={<Checkbox defaultChecked={showLearned} />}
          label="Include learned"
        />
        <FormControlLabel
          className="word-filter-checkbox"
          defaultChecked={showToLearnOnly}
          onChange={onChangeDisplayToLearn}
          control={<Checkbox defaultChecked={showToLearnOnly} />}
          label="Stared only"
        />
        <div ref={refPagination}>
          <Pagination {...paginationProps} key={pagination.key} />
        </div>
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
      {isContainerInView && !isPagInView && (
        <div className="pagination-sticky">
          <div className="pagination-sticky-inner">
            <Pagination
              {...paginationProps}
              onChange={(e, page) => {
                scrollToThis();
                paginationProps.onChange && paginationProps.onChange(e, page);
              }}
              key={pagination.key}
            />
          </div>
        </div>
      )}
    </div>
  );
};
