import { useEffect } from 'react';

import { networkLogger, NetworkLoggerConfig } from '../services/network-logger';

export const useNetworkLogger = (
  axiosInstance?: any,
  config?: Partial<NetworkLoggerConfig>,
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
        console.log('Network logger: Applied to axios instance via hook');
      } catch (error) {
        console.error('Network logger: Failed to apply via hook:', error);
      }
    }
  }, [axiosInstance]);
};
