import { useEffect, useRef } from "react";

import { networkLogger, NetworkLoggerConfig } from "../services/network-logger";

interface UseHttpTraceOptions {
  config?: Partial<NetworkLoggerConfig>;
  autoStart?: boolean;
}

interface UseHttpTraceReturn {
  shouldShowHttpTrace: boolean;
}

const useHttpTraceDev = (options?: UseHttpTraceOptions): UseHttpTraceReturn => {
  const startedRef = useRef(false);

  const { config, autoStart = true } = options || {};

  useEffect(() => {
    if (config) {
      networkLogger.configure(config);
    }
  }, [config]);

  useEffect(() => {
    if (autoStart && !startedRef.current) {
      networkLogger.startLogging();
      startedRef.current = true;
    }

    return () => {
      if (autoStart && startedRef.current) {
        networkLogger.stopLogging();
        startedRef.current = false;
      }
    };
  }, [autoStart]);

  return {
    shouldShowHttpTrace: true,
  };
};

const useHttpTraceProd = (): UseHttpTraceReturn => ({
  shouldShowHttpTrace: false,
});

export const useHttpTrace: (
  options?: UseHttpTraceOptions
) => UseHttpTraceReturn =
  __DEV__ ||
  process.env.APP_ENV === "development" ||
  process.env.APP_ENV === "staging"
    ? useHttpTraceDev
    : useHttpTraceProd;
