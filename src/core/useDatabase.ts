import { getDatabase, ref } from "@firebase/database";
import firebaseApp from "../firebase";
import {
  get as firebaseGet,
  set as firebaseSet,
  update as firebaseUpdate,
  remove as firebaseRemove,
} from "@firebase/database";
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
      return `${dbRootPathKey}/user/${userId}/${requestedPath}`.replace(
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
          `[DB_GET]: error occured at path '${decoratedPath(path)}'`,
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

  const getArray = useCallback(
    async <T>(path: string): Promise<Result<T[]>> => {
      const result = await get<{ [key: string]: T }>(path);
      if (result.isError()) return result.As<T[]>();

      const values = Object.entries(result.data ?? {}).reduce(
        (array, [indexStr, value]) => {
          if (Number.isNaN(indexStr)) {
            throw Result.ErrorMessage("Something is wrong with data indexing");
          }
          const index = Number(indexStr);
          if(index < 0) {
            throw Result.ErrorMessage(`Something is wrong with data indexing: invalid index: ${index}`);
          }
          array[Number(index)] = value;
          return array;
        },
        [] as T[]
      );
      return Result.Success(values);
    },
    [get]
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
          `[DB_SET]: error occured at path '${decoratedPath(path)}'`,
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

  const update = useCallback(
    async (path: string, item: object) => {
      removeUndefined(item);
      const time = Date.now();
      log(`\nDB_UPDATE: '${decoratedPath(path)}': [STARTED]`);
      try {
        await firebaseUpdate(ref(db, decoratedPath(path)), item);
        return Result.Success(null);
      } catch (error) {
        log(
          `[DB_UPDATE]: error occured at path '${decoratedPath(path)}'`,
          getStringifiedError(error)
        );
        return Result.Error(
          new AppGenericError("Something went wrong.", error)
        );
      } finally {
        log(
          `DB_UPDATE: '${decoratedPath(path)}': [FINISHED] at ${
            (Date.now() - time) / 1000
          }s\n`
        );
      }
    },
    [db, decoratedPath]
  );

  const remove = useCallback(
    async (path: string) => {
      const time = Date.now();
      log(`\nDB_REMOVE: '${decoratedPath(path)}': [STARTED]`);
      try {
        await firebaseRemove(ref(db, decoratedPath(path)));
        return Result.Success(null);
      } catch (error) {
        log(
          `[DB_REMOVE]: error occured at path '${decoratedPath(path)}'`,
          getStringifiedError(error)
        );
        return Result.Error(
          new AppGenericError("Something went wrong.", error)
        );
      } finally {
        log(
          `DB_REMOVE: '${decoratedPath(path)}': [FINISHED] at ${
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
        log(`[DB_EXISTS]: at path ${decoratedPath(path)}`);

        const snapshot = await firebaseGet(ref(db, decoratedPath(path)));
        if (!snapshot.exists()) {
          return Result.Success(false);
        }
        return Result.Success(true);
      } catch (error) {
        log(`[DB_EXISTS]: error occured`, error);
        return Result.Error(
          new AppGenericError("Something went wrong.", error)
        );
      }
    },
    [db, decoratedPath]
  );

  return {
    get,
    getArray,
    set,
    update,
    remove,
    exists,
  };
};
