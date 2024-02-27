import { useCallback } from "react";
import { Snack, StateActionType } from "./types";
import { useAppDispatch } from "./useAppDispatch";
import { uuidv4 } from "@firebase/util";

export const useUIFeedback = () => {
  const { dispatch } = useAppDispatch();

  const addSnack = useCallback(
    (snack: Omit<Snack, "key">) => {
      dispatch({
        type: StateActionType.PushSnack,
        payload: {
          ...snack,
          key: uuidv4(),
        },
      });
    },
    [dispatch]
  );

  const removeSnack = useCallback(
    (key: string) => {
      dispatch({
        type: StateActionType.RemoveSnack,
        payload: { key },
      });
    },
    [dispatch]
  );

  const displayError = useCallback(
    (message: string) =>
      addSnack({
        message,
        severity: "error",
      }),
    [addSnack]
  );

  const addSuccess = useCallback(
    (message: string) =>
      addSnack({
        message,
        severity: "success",
      }),
    [addSnack]
  );

  return {
    displayError,
    addSuccess,
    removeSnack,
  };
};
