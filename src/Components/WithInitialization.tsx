import { PropsWithChildren, useEffect } from "react";
import { useWordFunctions } from "../core/useWordFunctions";

export const WithInitialization = (props: PropsWithChildren) => {
  const { initLearnedWords, initWordsToLearn } = useWordFunctions();

  useEffect(() => {
    initLearnedWords();
    initWordsToLearn();
  }, [initLearnedWords, initWordsToLearn]);

  return <>{props.children}</>;
};
