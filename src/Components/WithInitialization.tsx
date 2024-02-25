import { PropsWithChildren, useCallback, useEffect } from "react";
import { useLearningActions } from "../app-context/useLearningActions";
import { useWordFunctions } from "../core/useWordFunctions";

export const WithInitialization = (props: PropsWithChildren) => {
  const { getLearntWords, getWordsToLearn } = useWordFunctions();
  const { setLearnWords, setWordsToLearn } = useLearningActions();

  const initializeKnownWords = useCallback(async () => {
    const learnedWords = await getLearntWords();
    setLearnWords(learnedWords);

    const wordsToLearn = await getWordsToLearn();
    setWordsToLearn(wordsToLearn);
  }, [getLearntWords, getWordsToLearn, setLearnWords, setWordsToLearn]);

  useEffect(() => {
    initializeKnownWords();
  }, [initializeKnownWords]);

  return <>{props.children}</>;
};
