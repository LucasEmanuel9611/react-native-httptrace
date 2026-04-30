import { useEffect, useRef } from "react";

import { networkLogger, NetworkLoggerConfig } from "../services/network-logger";

interface UseHttpTraceOptions {
  enabled?: boolean;
  config?: Partial<NetworkLoggerConfig>;
  autoStart?: boolean;
}

export const useHttpTrace = (options?: UseHttpTraceOptions) => {
  const startedRef = useRef(false);

  const { enabled = true, config, autoStart = true } = options || {};

  useEffect(() => {
    if (config) {
      networkLogger.configure(config);
    }
  }, [config]);

  useEffect(() => {
    if (enabled && autoStart && !startedRef.current) {
      networkLogger.startLogging();
      startedRef.current = true;
    }

    return () => {
      if (startedRef.current) {
        networkLogger.stopLogging();
        startedRef.current = false;
      }
    };
  }, [enabled, autoStart]);

  return {
    shouldShowHttpTrace: enabled,
  };
};
