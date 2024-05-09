import { SelectChangeEvent } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Pagination, { PaginationProps } from "@mui/material/Pagination";
import AppSelect from "../AppSelect";
import { uuidv4 } from "@firebase/util";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { useIsElementInView } from "../../hooks/useIsElementInView";
import { useIsElementFocused } from "../../hooks/useIsElementFocused";

import "./PaginatedResults.scss";
import { useRefState } from "../../hooks/useRefState";
import { Loader } from "../Loader";
import {
  AppEventHandler,
  AppEventType,
  TriggerRefreshPagEvent,
  useAppEvents,
} from "../../hooks/useAppEvents";

const pageOptions = [
  25, 50, 100, 150, 200, 250, 500, 1000, 1200, 1500, 1750, 2000, 2250, 2500,
].map((value) => ({ value }));

export const PaginatedResults = ({
  onChange: onChnagePagination,
  defaultPageSize,
  headerChild,
  items,
  renderItem,
}: {
  renderItem: (item: any) => React.ReactNode;
  headerChild?: React.ReactNode;
  defaultPageSize?: number;
  items: any[];
  onChange: (
    page: number,
    pageSize: number
  ) => Promise<{ total: number }>;
}) => {
  const { displayError } = useUIFeedback();
  const { addListener, removeListener } = useAppEvents();

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: defaultPageSize ?? 25,
    total: 0,
    key: uuidv4(),
  });

  const [loading, setLoading] = useRefState(true);

  const refContainer = useRef<HTMLDivElement>(null);
  const isContainerInView = useIsElementInView(refContainer.current);
  const refPagination = useRef<HTMLDivElement>(null);
  const isPagInView = useIsElementInView(refPagination.current);

  const { isFocused } = useIsElementFocused(refContainer.current);

  const numOfPages = useMemo(() => {
    return Math.ceil(pagination.total / pagination.pageSize);
  }, [pagination.total, pagination.pageSize]);

  const updatePagination = useCallback(
    async (page: number, pageSize: number) => {
      try {
        setLoading(true);
        const { total } = await onChnagePagination(
          page,
          pageSize
        );
        setPagination({
          pageSize,
          page,
          key: uuidv4(),
          total,
        });
      } catch (error) {
        console.error(error);
        displayError(error);
      } finally {
        setLoading(false);
      }
    },
    [displayError, onChnagePagination, setLoading]
  );

  const onChangePageSize = useCallback(
    async (e: SelectChangeEvent<string>) => {
      const pageSize = Number(e.target.value);
      updatePagination(1, pageSize);
    },
    [updatePagination]
  );

  const onChangePage = useCallback(
    async (page: number) => {
      updatePagination(page, pagination.pageSize);
    },
    [updatePagination, pagination.pageSize]
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
        updatePagination(
          pagination.page + 1,
          pagination.pageSize
        );
      } else if (e.key === "ArrowLeft" && pagination.page - 1 > 0) {
        updatePagination(
          pagination.page - 1,
          pagination.pageSize
        );
      }
    };
    window.addEventListener("keydown", onArrows);
    return () => {
      window.removeEventListener("keydown", onArrows);
    };
  }, [
    isFocused,
    numOfPages,
    onChangePage,
    pagination,
    updatePagination,
  ]);

  useEffect(() => {
    scrollToThis();
  }, [scrollToThis]);

  useEffect(() => {
    updatePagination(pagination.page, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler: AppEventHandler = (e) => {
      const { page } = (e as TriggerRefreshPagEvent).detail ?? {};
      updatePagination(
        page ?? pagination.page,
        pagination.pageSize
      );
    };

    addListener(AppEventType.TriggerRefreshPagination, handler);
    return () => {
      removeListener(AppEventType.TriggerRefreshPagination, handler);
    };
  }, [
    addListener,
    pagination.page,
    pagination.pageSize,
    removeListener,
    updatePagination,
  ]);

  const paginationProps: PaginationProps = {
    size: "large",
    className: "pagination",
    count: numOfPages,
    siblingCount: 1,
    boundaryCount: 1,
    page: pagination.page,
    onChange: (e, p) => onChangePage(p),
  };

  return (
    <div className="paginated-results" ref={refContainer}>
      <div className="word-header-pagination">
        <AppSelect
          className="pagination-size"
          label="Page size"
          value={pagination.pageSize}
          handleChange={onChangePageSize}
          options={pageOptions}
        />
        <div ref={refPagination}>
          <Pagination {...paginationProps} key={pagination.key} />
        </div>
        {!!headerChild && headerChild}
      </div>
      <div className="paginated-items">
        {loading && (
          <div className="pagination-loader">
            <Loader />
          </div>
        )}

        {!loading &&
          items.map((item, i) => (
            <div className="item-container" key={i}>
              {renderItem(item)}
            </div>
          ))}

        {!loading && !items.length && <div> No results. </div>}
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
