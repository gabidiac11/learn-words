export type Snack = {
  key: string;
  message: string;
  autoHideDuration?: number;
  transitionDuration?: number;
  severity: "error" | "success" | "info" | "warning";
  onClose?: () => void;
};
export type State = {
  snack: Snack | null;
  learnedWords: { [key: string]: true };
  wordsToLearn: string[];
};

export enum StateActionType {
  Init = "Init",
  PushSnack = "PushSnack",
  RemoveSnack = "RemoveSnack",
  SetKnownWords = "SetKnownWords",
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
      type: StateActionType.SetKnownWords;
      payload: {
        words: { [key: string]: true };
      };
    }
  | {
      type: StateActionType.SetWordsToLearn;
      payload: {
        words: string[];
      };
    };
