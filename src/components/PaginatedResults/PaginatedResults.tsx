import { SelectChangeEvent } from "@mui/material";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Pagination, { PaginationProps } from "@mui/material/Pagination";
import AppSelect from "../AppSelect";
import { uuidv4 } from "@firebase/util";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { useIsElementInView } from "../../hooks/useIsElementInView";
import { useIsElementFocused } from "../../hooks/useIsElementFocused";

import "./PaginatedResults.scss";
import { useRefState } from "../../hooks/useRefState";
import { Loader } from "../Loader";
import SelectedMenu, { DropdownProps } from "../AppDropdown/AppDropdown";

const pageOptions = [
  25, 50, 100, 150, 200, 250, 500, 1000, 1200, 1500, 1750, 2000, 2250, 2500,
].map((value) => ({ value }));

export type PaginationDropdownProps = Omit<DropdownProps, "onChange" | "value">;

export const PaginatedResults = ({
  onChange: onChnagePagination,
  defaultPageSize,
  filterOptions,
}: {
  defaultPageSize?: number;
  filterOptions?: PaginationDropdownProps;
  onChange: (
    page: number,
    pageSize: number,
    filterValues: string[]
  ) => Promise<{ total: number; items: ReactNode[] }>;
}) => {
  const [items, setItems] = useState<ReactNode[]>([]);
  const { displayError } = useUIFeedback();
  const [filterValues, setFilterValues] = useState<string[]>([]);

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
    async (page: number, pageSize: number, filterValues: string[]) => {
      try {
        setLoading(true);
        const { total, items } = await onChnagePagination(
          page,
          pageSize,
          filterValues
        );
        setPagination({
          pageSize,
          page,
          key: uuidv4(),
          total,
        });
        setFilterValues(filterValues);
        setItems(items);
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
      updatePagination(1, pageSize, filterValues);
    },
    [filterValues, updatePagination]
  );

  const onChangePage = useCallback(
    async (page: number) => {
      updatePagination(page, pagination.pageSize, filterValues);
    },
    [updatePagination, pagination.pageSize, filterValues]
  );

  const onChangeFilter = useCallback(
    async (value: string[]) => {
      updatePagination(1, pagination.pageSize, value);
    },
    [pagination.pageSize, updatePagination]
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
          pagination.pageSize,
          filterValues
        );
      } else if (e.key === "ArrowLeft" && pagination.page - 1 > 0) {
        updatePagination(
          pagination.page - 1,
          pagination.pageSize,
          filterValues
        );
      }
    };
    window.addEventListener("keydown", onArrows);
    return () => {
      window.removeEventListener("keydown", onArrows);
    };
  }, [
    filterValues,
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
    updatePagination(pagination.page, pagination.pageSize, filterValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {filterOptions && (
          <SelectedMenu
            label={filterOptions.label}
            icon={filterOptions.icon}
            options={filterOptions.options}
            value={filterValues}
            onChange={onChangeFilter}
          />
        )}
      </div>
      <div className="paginated-items">
        {loading && (
          <div className="pagination-loader">
            <Loader />
          </div>
        )}

        {!loading &&
          items.map((reactNode, i) => (
            <div className="item-container" key={i}>
              {reactNode}
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
