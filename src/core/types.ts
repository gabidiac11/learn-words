export class AppGenericError {
  isAppGenericError = true;
  message: string;
  originalError: unknown;
  constructor(_message: string, _originalError: unknown = null) {
    this.message = _message;
    this.originalError = _originalError;
  }
}

export type GenericMessageError = {
  message: string;
};

export default class Result<T> {
  public isAppResult = true;
  public data?: T;
  public errors?: AppGenericError[];

  public getCopy<T2>(): Result<T2> {
    const newResult = new Result<T2>();
    newResult.errors = this.errors;
    return newResult;
  }

  public isError(): boolean {
    return !!this.errors;
  }

  public throwIfError(preMessage?: string) {
    if (!this.isError()) {
      return;
    }
    if (!preMessage) {
      // eslint-disable-next-line no-throw-literal
      throw this;
    }

    this.errors = [new AppGenericError(preMessage), ...(this.errors ?? [])];
    // eslint-disable-next-line no-throw-literal
    throw this;
  }

  public static Error<T>(message: AppGenericError) {
    const result = new Result<T>();
    result.errors = [message];
    return result;
  }

  public static ErrorMessage<T>(message: string) {
    return Result.Error<T>(new AppGenericError(message));
  }

  public static Errors<T>(messages: AppGenericError[]) {
    const result = new Result<T>();
    result.errors = messages;
    return result;
  }

  public static Success<T>(data: T) {
    const result = new Result<T>();
    result.data = data;
    return result;
  }

  public static ErrorBadGateway<T>(message: AppGenericError) {
    const result = new Result<T>();
    result.errors = [message];
    return result;
  }

  public As<T2>() {
    const resultNew = new Result<T2>();
    resultNew.errors = this.errors;
    return resultNew;
  }
}

export type RecordWordsToLearnRemove = {
  [wordToLearnId: string]: {
    [recordId: string]: null;
  };
};

export type ContentSection = {
  content: string;
  isLearned: boolean;
}

export enum Extensions {
  Srt = ".srt", 
  Txt = ".txt"
}