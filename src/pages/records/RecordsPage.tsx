import React, { useMemo, useRef, useState } from "react";
import { LearningRecord } from "../../model.types";
import { PaginatedResults } from "../../components/PaginatedResults/PaginatedResults";
import { useCallback } from "react";
import { useWordFunctions } from "../../core/useWordFunctions";
import "./RecordsPage.scss";
import { useAppStateContext } from "../../app-context/useAppState";
import { useAppEvents } from "../../hooks/useAppEvents";
import { RecordItem } from "./RecordItem";
import AppDropdown from "../../components/AppDropdown/AppDropdown";
import { getPaginatedRecords } from "./pageFunctions";
import Input from "@mui/joy/Input";
import { Star } from "@mui/icons-material";

export default function Records() {
  const { getRecords } = useWordFunctions();
  const recordsRef = useRef<LearningRecord[]>();
  const { wordsToLearn } = useAppStateContext();
  const { emitPaginationTrigger } = useAppEvents();
  const [page, setPage] = useState(1);

  const [pageRecords, setPageRecords] = useState<LearningRecord[]>([]);

  const [toLearnFilters, setToLearnFilters] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const toLearnFilterOps = useMemo(
    () =>
      Object.keys(wordsToLearn)
        .sort((a, b) => {
          if (a > b) return 1;
          return -1;
        })
        .map((w) => ({ value: w, label: w })),
    [wordsToLearn]
  );

  const onChangePaginatin = useCallback(
    async (page: number, pageSize: number) => {
      // we use mânăreală here because firebase db doesn't provide pagination...
      const results = recordsRef.current ?? (await getRecords());
      if (!recordsRef.current) recordsRef.current = results;

      // const [records, total] = await getPaginatedRecordsMock(page, pageSize);
      const [records, total] = await getPaginatedRecords(
        page,
        pageSize,
        results,
        toLearnFilters,
        searchValue
      );

      setPage(page);
      setPageRecords(records);
      return {
        total,
      };
    },
    [getRecords, searchValue, toLearnFilters]
  );

  const onChangeToLearnFilter = useCallback(
    async (value: string[]) => {
      setToLearnFilters(value);
      setTimeout(() => {
        emitPaginationTrigger(1);
      }, 100);
    },
    [emitPaginationTrigger]
  );

  const onChangeSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
      setTimeout(() => {
        emitPaginationTrigger(1);
      }, 100);
    },
    [emitPaginationTrigger]
  );

  return (
    <div className="view page-wrapper">
      <div className="view-content records-container">
        <h3>Records</h3>
        <PaginatedResults
          onChange={onChangePaginatin}
          items={pageRecords}
          renderItem={(item: any) => {
            const r = item as LearningRecord;
            return (
              <RecordItem
                key={r.id}
                record={r}
                afterRemove={(id) => {
                  recordsRef.current = recordsRef.current?.filter(
                    (f) => f.id !== id
                  );
                  if (
                    page > 1 &&
                    pageRecords.filter((i) => i.id !== id).length === 0
                  ) {
                    emitPaginationTrigger(page - 1);
                    return;
                  }
                  emitPaginationTrigger();
                }}
              />
            );
          }}
          headerChild={
            <>
              <div className="pl-10 pr-10">
                <Input
                  value={searchValue}
                  onChange={onChangeSearch}
                  placeholder="Search..."
                />
              </div>
              <AppDropdown
                icon={<Star />}
                options={toLearnFilterOps}
                value={toLearnFilters}
                onChange={onChangeToLearnFilter}
              />
            </>
          }
        />
      </div>
    </div>
  );
}
