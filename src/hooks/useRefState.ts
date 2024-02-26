import { useCallback, useRef, useState } from "react";

export const useRefState = <T>(intialState: T) => {
  const [, _setState] = useState(intialState);
  const stateRef = useRef(intialState);

  const setState = useCallback((value: T) => {
    stateRef.current = value;
    _setState(stateRef.current);
  }, []);

  return [stateRef.current, setState] as [T, (v: T) => void];
};
