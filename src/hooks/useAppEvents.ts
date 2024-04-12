import { useCallback } from "react";

export enum AppEventType {
  WordLearningChange,
  TriggerRefreshPagination,
}

export type AppWordLearningEvent = {
  type: AppEventType.WordLearningChange;
  detail: {
    learned: boolean;
    word: string;
  };
};
export type TriggerRefreshPagEvent = {
  type: AppEventType.TriggerRefreshPagination;
};
export type AppEvent = {
  type: AppEventType;
  detail: any;
};
export type AppEventHandler = (e: AppEvent) => void;
export type AppEventListener = {
  type: AppEventType;
  handler: AppEventHandler;
};

class Listeners {
  static instance: Listeners | null = null;
  public listeners: AppEventListener[] = [];

  constructor() {
    if (Listeners.instance) {
      return Listeners.instance;
    }
    Listeners.instance = this;
  }

  public setListeners(
    callback: (prev: AppEventListener[]) => AppEventListener[]
  ) {
    this.listeners = callback(this.listeners);
  }
}
const instance = new Listeners();

export const useAppEvents = () => {
  const addListener = useCallback(
    (type: AppEventType, handler: AppEventHandler) => {
      instance.setListeners((l) => [...l, { type, handler }]);
    },
    []
  );

  const removeListener = useCallback(
    (type: AppEventType, handler: AppEventHandler) => {
      instance.setListeners((l) =>
        l.filter((i) => !(i.handler === handler && type === i.type))
      );
    },
    []
  );

  const emitEvent = useCallback((event: AppEvent) => {
    instance.listeners.forEach((listener) => {
      if (listener.type === event.type) {
        listener.handler(event);
      }
    });
  }, []);

  const emitWordLearningChange = useCallback(
    (word: string, learned: boolean) => {
      emitEvent({
        type: AppEventType.WordLearningChange,
        detail: {
          word,
          learned,
        },
      });
    },
    [emitEvent]
  );

  const emitPaginationTrigger = useCallback(() => {
    emitEvent({
      type: AppEventType.TriggerRefreshPagination,
      detail: null,
    });
  }, [emitEvent]);

  return {
    addListener,
    removeListener,
    emitWordLearningChange,
    emitPaginationTrigger,
  };
};
