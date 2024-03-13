import { PropsWithChildren, useEffect } from "react";
import { useWordFunctions } from "../core/useWordFunctions";
import { useRefState } from "../hooks/useRefState";
import { LoaderView } from "./Loader";

export const WithInitialization = (props: PropsWithChildren) => {
  const { initLearnedWords, initWordsToLearn } = useWordFunctions();

  const [loaded, setLoaded] = useRefState(false);

  useEffect(() => {
    let loadedValues = [false, false];
    initLearnedWords().then(() => {
      loadedValues[0] = true;
      setLoaded(loadedValues.every((i) => i));
    });
    initWordsToLearn().then(() => {
      loadedValues[1] = true;
      setLoaded(loadedValues.every((i) => i));
    });
  }, [initLearnedWords, initWordsToLearn, setLoaded]);

  if (!loaded) {
    return <LoaderView />;
  }

  return <>{props.children}</>;
};
