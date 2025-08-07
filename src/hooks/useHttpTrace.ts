import { useEffect } from "react";

import { networkLogger, NetworkLoggerConfig } from "../services/network-logger";

export const useHttpTrace = (
  axiosInstance?: any,
  config?: Partial<NetworkLoggerConfig>
) => {
  useEffect(() => {
    if (config) {
      networkLogger.configure(config);
    }
  }, [config]);

  useEffect(() => {
    if (axiosInstance) {
      try {
        networkLogger.createAxiosInterceptors(axiosInstance);
        console.log("HTTP Trace: Applied to axios instance via hook");
      } catch (error) {
        console.error("HTTP Trace: Failed to apply via hook:", error);
      }
    }
  }, [axiosInstance]);
};
