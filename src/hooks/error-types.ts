export type FetchError = {
  message: string;
  originalError: unknown;
};

export type FetchFirebaseError = {
    message: string;
    originalError: {
        code: string;
    };
  };
