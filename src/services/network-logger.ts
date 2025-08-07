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
  type?: "fetch" | "xhr" | "axios";
}

export interface NetworkLoggerConfig {
  baseUrl?: string;
  maxRequests?: number;
  enableConsoleLogs?: boolean;
  captureRequestBody?: boolean;
  captureResponseBody?: boolean;
}

type NetworkLoggerCallback = (requests: NetworkRequest[]) => void;

interface NetworkLoggerState {
  requests: NetworkRequest[];
  subscribers: NetworkLoggerCallback[];
  config: NetworkLoggerConfig;
  isActive: boolean;
  originalFetch?: typeof fetch;
  originalXHROpen?: typeof XMLHttpRequest.prototype.open;
  originalXHRSend?: typeof XMLHttpRequest.prototype.send;
}

const defaultConfig: NetworkLoggerConfig = {
  baseUrl: "http://localhost",
  maxRequests: 1000,
  enableConsoleLogs: true,
  captureRequestBody: true,
  captureResponseBody: true,
};

const createNetworkLoggerState = (
  config: NetworkLoggerConfig = {}
): NetworkLoggerState => ({
  requests: [],
  subscribers: [],
  config: { ...defaultConfig, ...config },
  isActive: false,
});

let networkLoggerState = createNetworkLoggerState();

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

const notifySubscribers = (): void => {
  const currentRequests = [...networkLoggerState.requests];
  networkLoggerState.subscribers.forEach((callback) => {
    callback(currentRequests);
  });
};

const addRequest = (request: NetworkRequest): void => {
  const currentRequests = networkLoggerState.requests;
  const newRequestAtBeginning = [request, ...currentRequests];
  const keepOnlyLastRequests = newRequestAtBeginning.slice(
    0,
    networkLoggerState.config.maxRequests || 1000
  );

  networkLoggerState = {
    ...networkLoggerState,
    requests: keepOnlyLastRequests,
  };

  notifySubscribers();
};

const updateRequest = (id: string, updates: Partial<NetworkRequest>): void => {
  const updateRequestById = (req: NetworkRequest) =>
    req.id === id ? { ...req, ...updates } : req;

  const updatedRequests = networkLoggerState.requests.map(updateRequestById);

  networkLoggerState = {
    ...networkLoggerState,
    requests: updatedRequests,
  };

  notifySubscribers();
};

const normalizeHeaders = (headers: any): Record<string, string> => {
  const normalized: Record<string, string> = {};

  if (headers) {
    if (headers.entries) {
      for (const [key, value] of headers.entries()) {
        normalized[key.toLowerCase()] = String(value);
      }
    } else if (typeof headers === "object") {
      Object.keys(headers).forEach((key) => {
        normalized[key.toLowerCase()] = String(headers[key]);
      });
    }
  }

  return normalized;
};

const parseBody = async (body: any): Promise<any> => {
  if (!body) return undefined;

  if (typeof body === "string") return body;
  if (body instanceof FormData) return "[FormData]";
  if (body instanceof ArrayBuffer) return "[ArrayBuffer]";
  if (body instanceof Blob) {
    try {
      return await body.text();
    } catch {
      return "[Blob]";
    }
  }

  try {
    return JSON.stringify(body);
  } catch {
    return String(body);
  }
};

const parseResponse = async (response: any): Promise<any> => {
  if (!networkLoggerState.config.captureResponseBody) return undefined;

  try {
    if (response && typeof response.clone === "function") {
      const cloned = response.clone();
      const text = await cloned.text();

      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
    return response;
  } catch {
    return "[Unable to parse response]";
  }
};

// Fetch interceptor
const createFetchInterceptor = () => {
  if (!networkLoggerState.originalFetch) {
    networkLoggerState.originalFetch = globalThis.fetch;
  }

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestId = generateId();
    const startTime = Date.now();
    const url = typeof input === "string" ? input : input.toString();
    const method = init?.method?.toUpperCase() || "GET";

    let requestBody: any;
    if (networkLoggerState.config.captureRequestBody && init?.body) {
      requestBody = await parseBody(init.body);
    }

    const request: NetworkRequest = {
      id: requestId,
      method,
      url,
      fullUrl: url,
      headers: normalizeHeaders(init?.headers),
      body: requestBody,
      startTime,
      timestamp: new Date(),
      type: "fetch",
    };

    addRequest(request);

    try {
      const response = await networkLoggerState.originalFetch!(input, init);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const responseBody = await parseResponse(response);

      updateRequest(requestId, {
        status: response.status,
        response: responseBody,
        endTime,
        duration,
      });

      return response;
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      updateRequest(requestId, {
        error: error.message || String(error),
        endTime,
        duration,
      });

      throw error;
    }
  };
};

// XMLHttpRequest interceptor
const createXHRInterceptor = () => {
  if (!networkLoggerState.originalXHROpen) {
    networkLoggerState.originalXHROpen = XMLHttpRequest.prototype.open;
    networkLoggerState.originalXHRSend = XMLHttpRequest.prototype.send;
  }

  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    ...args: any[]
  ) {
    const requestId = generateId();
    const startTime = Date.now();

    (this as any)._networkLogger = {
      id: requestId,
      method: method.toUpperCase(),
      url: url.toString(),
      startTime,
    };

    return networkLoggerState.originalXHROpen!.call(
      this,
      method,
      url.toString(),
      ...args
    );
  };

  XMLHttpRequest.prototype.send = function (body?: any) {
    const loggerData = (this as any)._networkLogger;

    if (loggerData) {
      let requestBody: any;
      if (networkLoggerState.config.captureRequestBody && body) {
        requestBody = parseBody(body);
      }

      const request: NetworkRequest = {
        id: loggerData.id,
        method: loggerData.method,
        url: loggerData.url,
        fullUrl: loggerData.url,
        headers: {},
        body: requestBody,
        startTime: loggerData.startTime,
        timestamp: new Date(),
        type: "xhr",
      };

      addRequest(request);

      const originalOnReadyStateChange = this.onreadystatechange;

      this.onreadystatechange = function (event?: Event) {
        if (this.readyState === 4) {
          const endTime = Date.now();
          const duration = endTime - loggerData.startTime;

          let responseBody: any;
          if (networkLoggerState.config.captureResponseBody) {
            try {
              responseBody = this.responseText
                ? JSON.parse(this.responseText)
                : this.responseText;
            } catch {
              responseBody = this.responseText;
            }
          }

          updateRequest(loggerData.id, {
            status: this.status,
            response: responseBody,
            endTime,
            duration,
          });
        }

        if (originalOnReadyStateChange && event) {
          originalOnReadyStateChange.call(this, event);
        }
      };
    }

    return networkLoggerState.originalXHRSend!.call(this, body);
  };
};

const createAxiosInterceptor = (axiosInstance: any) => {
  if (!axiosInstance || !axiosInstance.interceptors) {
    return;
  }

  axiosInstance.interceptors.request.use(
    (config: any) => {
      const requestId = generateId();
      const startTime = Date.now();

      const request: NetworkRequest = {
        id: requestId,
        method: config.method?.toUpperCase() || "GET",
        url: config.url || "",
        fullUrl: config.url,
        headers: normalizeHeaders(config.headers),
        body: config.data,
        startTime,
        timestamp: new Date(),
        type: "axios",
      };

      addRequest(request);

      return {
        ...config,
        _networkLoggerId: requestId,
        _networkLoggerStartTime: startTime,
      };
    },
    (error: any) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response: any) => {
      const requestId = response.config?._networkLoggerId;
      const startTime = response.config?._networkLoggerStartTime;

      if (requestId && startTime) {
        const endTime = Date.now();
        const duration = endTime - startTime;

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
      const requestId = error.config?._networkLoggerId;
      const startTime = error.config?._networkLoggerStartTime;

      if (requestId && startTime) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        updateRequest(requestId, {
          status: error.response?.status,
          error: error.response?.data || error.message,
          endTime,
          duration,
        });
      }

      return Promise.reject(error);
    }
  );
};

const startLogging = (): void => {
  if (networkLoggerState.isActive) return;

  createFetchInterceptor();
  createXHRInterceptor();

  networkLoggerState.isActive = true;

  if (networkLoggerState.config.enableConsoleLogs) {
    console.log("🌐 HttpTrace: Native network interceptors started");
  }
};

const stopLogging = (): void => {
  if (!networkLoggerState.isActive) return;

  if (networkLoggerState.originalFetch) {
    globalThis.fetch = networkLoggerState.originalFetch;
  }

  if (networkLoggerState.originalXHROpen) {
    XMLHttpRequest.prototype.open = networkLoggerState.originalXHROpen;
  }

  if (networkLoggerState.originalXHRSend) {
    XMLHttpRequest.prototype.send = networkLoggerState.originalXHRSend;
  }

  networkLoggerState.isActive = false;

  if (networkLoggerState.config.enableConsoleLogs) {
    console.log("🌐 HttpTrace: Native network interceptors stopped");
  }
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
      subscribers: networkLoggerState.subscribers.filter(
        (cb) => cb !== callback
      ),
    };
  };
};

const configure = (config: Partial<NetworkLoggerConfig>): void => {
  networkLoggerState = {
    ...networkLoggerState,
    config: { ...networkLoggerState.config, ...config },
  };
};

export const networkLogger = {
  startLogging,
  stopLogging,
  clearRequests,
  subscribe,
  configure,
  createAxiosInterceptor,
  createAxiosInterceptors: createAxiosInterceptor,
};
