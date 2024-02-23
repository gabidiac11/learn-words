import { AxiosError, AxiosResponse } from "axios";
import { useState, useEffect, useCallback, useRef } from "react";
import { FetchError } from "./error-types";

export const useFetchPromise = <T>() => {
  const [call, setCall] = useState<{
    promiseCallback: () => Promise<T>;
  }>();
  const [data, setData] = useState<T>();

  //used to force a new rendering
  const [, setLoadingKey] = useState<number>(0);
  const loadingRef = useRef<{ key: number; value: boolean }>({
    key: 0,
    value: false,
  });

  const [error, setError] = useState<FetchError>();

  const setLoading = useCallback((value: boolean) => {
    loadingRef.current.value = value;
    loadingRef.current.key++;
    setLoadingKey(loadingRef.current.key);
  }, []);

  const fetchData = useCallback(async () => {
    if (!call) return;
    const { promiseCallback } = call;

    try {
      setLoading(true);

      if (typeof promiseCallback !== "function") {
        throw new Error("Callback is not a function");
      }

      const data = await promiseCallback();
      setData(data);
      setError(undefined);
    } catch (error) {
      setError(computeError(error));
    } finally {
      setLoading(false);
    }
  }, [call, setLoading]);

  const executeFetch = useCallback((promiseCallback: () => Promise<T>) => {
    setCall({ promiseCallback });
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

  return {
    executeFetch,
    data,
    loading: loadingRef.current.value,
    error,
  };
};

export const useFetchAxios = <T>() => {
  const [response, setResponse] = useState<AxiosResponse<T>>();
  const [call, setCall] = useState<{
    promiseCallback: () => Promise<AxiosResponse<T>>;
  }>();

  //used to force a new rendering
  const [, setLoadingKey] = useState<number>(0);
  const loadingRef = useRef<{ key: number; value: boolean }>({
    key: 0,
    value: true,
  });

  const [error, setError] = useState<FetchError>();

  const setLoading = useCallback((value: boolean) => {
    loadingRef.current.value = value;
    loadingRef.current.key++;
    setLoadingKey(loadingRef.current.key);
  }, []);

  const fetchData = useCallback(async () => {
    if (!call) return;
    const { promiseCallback } = call;

    try {
      setLoading(true);

      if (typeof promiseCallback !== "function") {
        throw new Error("Callback is not a function");
      }

      const response = await promiseCallback();
      setResponse(response);
      setError(undefined);
    } catch (error) {
      const playableError = computeError(error);
      setError(playableError);
    } finally {
      setLoading(false);
    }
  }, [call, setLoading]);

  const executeFetch = useCallback((promiseCallback: () => Promise<AxiosResponse<T>>) => {
    setCall({ promiseCallback });
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

  return {
    executeFetch,
    response,
    loading: loadingRef.current.value,
    error,
  };
};

function computeError(originalError: unknown): FetchError {
  if (!originalError) {
    return { message: "Unknown error.", originalError };
  }

  if (typeof originalError === "string") {
    return { message: originalError, originalError };
  }

  const errorAsAxios = originalError as AxiosError;
  if (errorAsAxios?.isAxiosError) {
    return { message: errorAsAxios.message, originalError };
  }

  return {
    message:
      (originalError as { message?: string }).message ?? "Something wen wrong.",
    originalError,
  };
}