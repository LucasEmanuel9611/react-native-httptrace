import { useEffect, useRef } from "react";

import { networkLogger, NetworkLoggerConfig } from "../services/network-logger";

interface UseHttpTraceOptions {
  axiosInstance?: any;
  config?: Partial<NetworkLoggerConfig>;
  autoStart?: boolean;
}

export const useHttpTrace = (
  optionsOrAxiosInstance?: UseHttpTraceOptions | any,
  legacyConfig?: Partial<NetworkLoggerConfig>
) => {
  const startedRef = useRef(false);

  const options: UseHttpTraceOptions =
    optionsOrAxiosInstance &&
    (optionsOrAxiosInstance.interceptors ||
      typeof optionsOrAxiosInstance === "function")
      ? {
          axiosInstance: optionsOrAxiosInstance,
          config: legacyConfig,
          autoStart: false,
        }
      : { autoStart: true, ...optionsOrAxiosInstance };

  const { axiosInstance, config, autoStart = true } = options;

  useEffect(() => {
    if (config) {
      networkLogger.configure(config);
    }
  }, [config]);

  useEffect(() => {
    if (axiosInstance) {
      try {
        networkLogger.createAxiosInterceptors(axiosInstance);
        console.log("🌐 HttpTrace: Applied to axios instance");
      } catch (error) {
        console.error("🌐 HttpTrace: Failed to apply to axios:", error);
      }
    }

    if (autoStart && !startedRef.current) {
      networkLogger.startLogging();
      startedRef.current = true;
      console.log("🌐 HttpTrace: Native interceptors started");
    }

    return () => {
      if (autoStart && startedRef.current) {
        networkLogger.stopLogging();
        startedRef.current = false;
        console.log("🌐 HttpTrace: Native interceptors stopped");
      }
    };
  }, [axiosInstance, autoStart]);

  return {
    startLogging: () => {
      if (!startedRef.current) {
        networkLogger.startLogging();
        startedRef.current = true;
      }
    },
    stopLogging: () => {
      if (startedRef.current) {
        networkLogger.stopLogging();
        startedRef.current = false;
      }
    },
    clearRequests: networkLogger.clearRequests,
  };
};
