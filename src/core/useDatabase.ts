import { getDatabase, ref } from "@firebase/database";
import firebaseApp from "../firebase";
import { get as firebaseGet, set as firebaseSet } from "@firebase/database";
import Result, { AppGenericError } from "./types";
import { log } from "./logger";
import { dbRootPathKey } from "../constants";
import { getStringifiedError, removeUndefined } from "../utils";
import { useCallback, useRef } from "react";
import { useAppUser } from "../auth/authHooks";

export const useDatabase = () => {
  const { user } = useAppUser();
  const userId = user?.uid ?? "empty";

  const dbRef = useRef(getDatabase(firebaseApp));
  const db = dbRef.current;

  const decoratedPath = useCallback(
    (requestedPath: string) => {
      return `${dbRootPathKey}/user-${userId}/${requestedPath}`.replace(
        "//",
        "/"
      );
    },
    [userId]
  );

  const get = useCallback(
    async <T>(path: string): Promise<Result<T>> => {
      const time = Date.now();
      log(`\nDB_GET: '${decoratedPath(path)}': [STARTED]`);
      try {
        const snapshot = await firebaseGet(ref(db, decoratedPath(path)));
        const value = snapshot.val() as T;

        return Result.Success(value);
      } catch (error) {
        log(
          `[db]: error occured at path '${decoratedPath(path)}'`,
          getStringifiedError(error)
        );
        return Result.Error(
          new AppGenericError("Something went wrong.", error)
        );
      } finally {
        log(
          `DB_GET: '${decoratedPath(path)}': [FINISHED] at ${
            (Date.now() - time) / 1000
          }s\n`
        );
      }
    },
    [db, decoratedPath]
  );

  const set = useCallback(
    async <T>(path: string, item: T) => {
      removeUndefined(item);
      const time = Date.now();
      log(`\nDB_SET: '${decoratedPath(path)}': [STARTED]`);
      try {
        await firebaseSet(ref(db, decoratedPath(path)), item);
        return Result.Success(null);
      } catch (error) {
        log(
          `[db]: error occured at path '${decoratedPath(path)}'`,
          getStringifiedError(error)
        );
        return Result.Error(
          new AppGenericError("Something went wrong.", error)
        );
      } finally {
        log(
          `DB_SET: '${decoratedPath(path)}': [FINISHED] at ${
            (Date.now() - time) / 1000
          }s\n`
        );
      }
    },
    [db, decoratedPath]
  );

  const exists = useCallback(
    async (path: string): Promise<Result<boolean>> => {
      try {
        log(`[db-exists]: at path ${decoratedPath(path)}`);

        const snapshot = await firebaseGet(ref(db, decoratedPath(path)));
        if (!snapshot.exists()) {
          return Result.Success(false);
        }
        return Result.Success(true);
      } catch (error) {
        log(`[db-exists]: error occured`, error);
        return Result.Error(
          new AppGenericError("Something went wrong.", error)
        );
      }
    },
    [db, decoratedPath]
  );

  return {
    get,
    set,
    exists,
  };
};
