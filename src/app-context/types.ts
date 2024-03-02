export type Snack = {
  key: string;
  message: string;
  autoHideDuration?: number;
  transitionDuration?: number;
  severity: "error" | "success" | "info" | "warning";
  onClose?: () => void;
};

export type Uuid = string;

export type Words = { [key: string]: Uuid };

export type RecordWordsToLearn = {
  [wordToLearnId: string]: {
    [recordId: string]: number;
  };
};

export type State = {
  snack: Snack | null;
  learnedWords: Words;
  wordsToLearn: Words;
};

export enum StateActionType {
  Init = "Init",
  PushSnack = "PushSnack",
  RemoveSnack = "RemoveSnack",
  SetLearnedWords = "SetLearnedWords",
  SetWordsToLearn = "SetWordsToLearn",
}

export type StateAction =
  | {
      type: StateActionType.Init;
    }
  | {
      type: StateActionType.PushSnack;
      payload: Snack;
    }
  | {
      type: StateActionType.RemoveSnack;
      payload: {
        key: string;
      };
    }
  | {
      type: StateActionType.SetLearnedWords;
      payload: {
        words: Words;
      };
    }
  | {
      type: StateActionType.SetWordsToLearn;
      payload: {
        words: Words;
      };
    };
