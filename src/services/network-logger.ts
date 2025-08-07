import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  fullUrl?: string;
  headers: Record<string, string>;
  body?: any;
  status?: number;
  response?: any;
  error?: any;
  startTime: number;
  endTime?: number;
  duration?: number;
  timestamp: Date;
}

export interface NetworkLoggerConfig {
  baseUrl?: string;
  maxRequests?: number;
  enableConsoleLogs?: boolean;
}

type NetworkLoggerCallback = (requests: NetworkRequest[]) => void;

interface NetworkLoggerState {
  requests: NetworkRequest[];
  subscribers: NetworkLoggerCallback[];
  appliedInstances: Set<AxiosInstance>;
  config: NetworkLoggerConfig;
}

const defaultConfig: NetworkLoggerConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost',
  maxRequests: 1000,
  enableConsoleLogs: true,
};

const createNetworkLoggerState = (
  config: NetworkLoggerConfig = {},
): NetworkLoggerState => ({
  requests: [],
  subscribers: [],
  appliedInstances: new Set(),
  config: { ...defaultConfig, ...config },
});

let networkLoggerState = createNetworkLoggerState();

const notifySubscribers = (): void => {
  const currentRequests = [...networkLoggerState.requests];

  networkLoggerState.subscribers.forEach(callback => {
    callback(currentRequests);
  });
};

const clearRequests = (): void => {
  networkLoggerState = {
    ...networkLoggerState,
    requests: [],
  };
  notifySubscribers();
};

const subscribe = (callback: NetworkLoggerCallback): (() => void) => {
  networkLoggerState = {
    ...networkLoggerState,
    subscribers: [...networkLoggerState.subscribers, callback],
  };
  callback([...networkLoggerState.requests]);

  return () => {
    networkLoggerState = {
      ...networkLoggerState,
      subscribers: networkLoggerState.subscribers.filter(cb => cb !== callback),
    };
  };
};

const configure = (config: Partial<NetworkLoggerConfig>): void => {
  networkLoggerState = {
    ...networkLoggerState,
    config: { ...networkLoggerState.config, ...config },
  };
};

const createAxiosInterceptors = (axiosInstance: AxiosInstance): void => {
  const addRequest = (request: NetworkRequest): void => {
    const currentRequests = networkLoggerState.requests;
    const newRequestAtBeginning = [request, ...currentRequests];
    const keepOnlyLastRequests = newRequestAtBeginning.slice(
      0,
      networkLoggerState.config.maxRequests || 1000,
    );

    networkLoggerState = {
      ...networkLoggerState,
      requests: keepOnlyLastRequests,
    };

    notifySubscribers();
  };

  const updateRequest = (
    id: string,
    updates: Partial<NetworkRequest>,
  ): void => {
    const updateRequestById = (req: NetworkRequest) =>
      req.id === id ? { ...req, ...updates } : req;

    const updatedRequests = networkLoggerState.requests.map(updateRequestById);

    networkLoggerState = {
      ...networkLoggerState,
      requests: updatedRequests,
    };

    notifySubscribers();
  };

  if (
    !axiosInstance ||
    networkLoggerState.appliedInstances.has(axiosInstance)
  ) {
    return;
  }

  networkLoggerState = {
    ...networkLoggerState,
    appliedInstances: new Set([
      ...networkLoggerState.appliedInstances,
      axiosInstance,
    ]),
  };

  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig<any>) => {
      const requestId = Math.random().toString(36).substr(2, 9);
      const startTime = Date.now();

      let fullUrl = config.url;
      if (
        config.baseURL &&
        !fullUrl?.startsWith('http://') &&
        !fullUrl?.startsWith('https://')
      ) {
        fullUrl = `${config.baseURL}${
          fullUrl?.startsWith('/') ? '' : '/'
        }${fullUrl}`;
      } else if (
        !fullUrl?.startsWith('http://') &&
        !fullUrl?.startsWith('https://')
      ) {
        const { baseUrl } = networkLoggerState.config;
        fullUrl = `${baseUrl}${fullUrl?.startsWith('/') ? '' : '/'}${fullUrl}`;
      }

      const request: NetworkRequest = {
        id: requestId,
        method: config.method?.toUpperCase() || 'GET',
        url: config.url || '',
        fullUrl,
        headers: config.headers || {},
        body: config.data,
        startTime,
        timestamp: new Date(),
      };

      addRequest(request);

      return {
        ...config,
        requestId,
        startTime,
      };
    },
    (error: any) => {
      if (networkLoggerState.config.enableConsoleLogs) {
        console.error('Network logger request interceptor error:', error);
      }
      return Promise.reject(error);
    },
  );

  axiosInstance.interceptors.response.use(
    (response: any) => {
      const requestId = response.config?.requestId;
      const startTime = response.config?.startTime;
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (requestId) {
        updateRequest(requestId, {
          status: response.status,
          response: response.data,
          endTime,
          duration,
        });
      }

      return response;
    },
    (error: any) => {
      const requestId = error.config?.requestId;
      const startTime = error.config?.startTime;
      const endTime = Date.now();
      const duration = startTime ? endTime - startTime : undefined;

      if (requestId) {
        updateRequest(requestId, {
          status: error.response?.status,
          error: error.response?.data || error.message,
          endTime,
          duration,
        });
      }

      return Promise.reject(error);
    },
  );

  if (networkLoggerState.config.enableConsoleLogs) {
    console.log('Network logger: Successfully applied to axios instance');
  }
};

export const networkLogger = {
  clearRequests,
  subscribe,
  createAxiosInterceptors,
  configure,
};
