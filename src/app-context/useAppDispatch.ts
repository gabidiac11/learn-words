import { useContext, useCallback } from "react";
import { AppContext } from "./AppContext";
import { StateAction } from "./types";

export const useAppDispatch = () => {
  const { dispatch: _dispatch } = useContext(AppContext);

  const dispatch = useCallback(
    (action: StateAction) => {
      _dispatch(action);
    },
    [_dispatch]
  );

  return {
    dispatch,
  };
};
