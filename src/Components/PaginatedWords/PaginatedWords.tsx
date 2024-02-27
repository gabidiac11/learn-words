import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { useRefState } from "../../hooks/useRefState";
import "./PaginatedWords.scss";
import AppSelect from "../AppSelect";
import { uuidv4 } from "@firebase/util";
import { useAppStateContext } from "../../app-context/useAppState";
import { useWordFunctions } from "../../core/useWordFunctions";
import { getErrorMessage } from "../../utils";
import { useUIFeedback } from "../../app-context/useUIFeedback";

const pageOptions = [20, 50, 100, 150, 200, 250, 500, 1000, 1200, 1500].map(
  (value) => ({ value })
);

export const PaginatedWords = ({ words }: { words: [string, number][] }) => {
  const [pagination, setPagination] = useState({
    page: 1,
    count: 20,
    key: uuidv4(),
  });
  const { learnedWords } = useAppStateContext();
  const { addLearnedWord, removeLearnedWord } = useWordFunctions();
  const { displayError } = useUIFeedback();

  const startIndex = pagination.page * pagination.count - pagination.count;
  const endIndex = pagination.page * pagination.count;
  const numOfPages = Math.ceil(words.length / pagination.count);

  const [isFocused, setIsFocused] = useRefState<boolean>(false);
  const refContainer = useRef<HTMLDivElement>(null);

  const onClickWordItem = useCallback(
    async (word: string) => {
      try {
        await (learnedWords[word]
          ? removeLearnedWord(word)
          : addLearnedWord(word));
      } catch (error) {
        displayError(getErrorMessage(error));
      }
    },
    [addLearnedWord, displayError, learnedWords, removeLearnedWord]
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

  // TODO: make filters and pagination sticky while this is into view
  // TODO: get a ux friendly way to add words to learn list (global) or on the record level
  // TODO: implement swipe left-right

  return (
    <div
      className={`paginated-words ${isFocused ? "is-focused" : ""}`}
      ref={refContainer}
    >
      <div className="flex-row flex-align-center">
        <AppSelect
          label="Page size"
          value={pagination.count}
          handleChange={(e) => {
            const count = Number(e.target.value);
            setPagination({ ...pagination, count, key: uuidv4(), page: 1 });
          }}
          options={pageOptions}
        />
        <Pagination
          key={pagination.key}
          count={numOfPages}
          siblingCount={0}
          boundaryCount={2}
          page={pagination.page}
          onChange={(e, page) => {
            setPagination({ ...pagination, page });
          }}
        />
        <Box>{words.length} unique words.</Box>
      </div>
      <div className="word-items">
        {words.map(([w, count], i) => {
          if (!(i >= startIndex && i <= endIndex)) {
            return null;
          }
          return (
            <div
              key={i}
              className="word-item"
              style={{ opacity: learnedWords[w] ? 0.2 : 1 }}
              onClick={() => onClickWordItem(w)}
            >
              <Typography
                variant="h6"
                noWrap
                tabIndex={0}
                component="div"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                <span
                  style={{
                    // TODO: make a cool color scheme based on num of occurences
                    color: `rgba(${Math.floor(count / 100) * 10},${0},${0}, 1)`,
                  }}
                >
                  {count}
                </span>
                :{w}
              </Typography>
            </div>
          );
        })}
      </div>
    </div>
  );
};
