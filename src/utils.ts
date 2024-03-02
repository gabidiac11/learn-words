import React, { KeyboardEventHandler } from "react";
import Result, { AppGenericError, GenericMessageError } from "./core/types";

export const useOnEnter = (
  handleSubmit: () => void
): KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> => {
  return (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };
};

export const getErrorMessage = (error: unknown): string => {
  if (typeof error == "string") {
    return error;
  }

  if (Array.isArray(error)) {
    return (
      error?.map((value) => getErrorMessage(value)).join(". ") ??
      "Something went wrong."
    );
  }

  const errorAsGeneric = error as AppGenericError;
  if (errorAsGeneric?.isAppGenericError) {
    return errorAsGeneric.message;
  }

  const errorAsResult = error as Result<unknown>;
  if (errorAsResult?.isAppResult) {
    return (
      errorAsResult.errors?.map((value) => value.message).join(". ") ??
      "Something went wrong."
    );
  }

  const messageError = error as GenericMessageError;
  return messageError.message ?? "Something went wrong.";
};

export const valuesOrdered = <T>(obj: { [id: string]: T }) => {
  const values = Object.values(obj).sort((i1, i2) => {
    if (
      (i1 as unknown as { order: number }).order ===
      (i2 as unknown as { order: number }).order
    )
      return 0;

    if (
      (i1 as unknown as { order: number }).order <
      (i2 as unknown as { order: number }).order
    ) {
      return -1;
    }
    return 1;
  });
  return values as unknown as T[];
};

export function getStringifiedError(
  error: unknown,
  _maxLevel?: number,
  _level?: number
): string {
  const maxLevel = _maxLevel ?? 0;
  const level = _level ?? 0;

  let stringifiedError = "";
  if (error && typeof error === "object") {
    stringifiedError = Object.entries(error)
      .map((curr) => {
        const [key, value] = curr;
        if (level < maxLevel) {
          const stringifiedSubValue = getStringifiedError(
            value,
            maxLevel,
            level + 1
          );
          return `[${key}:${stringifiedSubValue}]`;
        }
        return `[${key}:${value}]`;
      })
      .join(",");
  }
  if (error && typeof error !== "object") {
    stringifiedError = String(error);
  }
  return stringifiedError;
}

/**
 * recursively remove undefined value from JSON because google firestore accept only null's over undefined's
 * there is a good case for using null as it's more evident what all json structures should look like, but for now we'll use this solution
 * @param value
 */
export function removeUndefined(value: unknown) {
  if (!!value && typeof value === "object") {
    const valueAsObj = value as { [key: string]: unknown };
    for (const prop in value) {
      if (valueAsObj[prop] === undefined) {
        delete valueAsObj[prop];
      } else {
        removeUndefined(valueAsObj[prop]);
      }
    }
  }
}
