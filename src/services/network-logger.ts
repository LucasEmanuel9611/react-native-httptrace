export interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  fullUrl?: string;
  headers: Record<string, string>;
  responseHeaders?: Record<string, string>;
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

type RequestFilter = (request: NetworkRequest) => boolean;

export interface NetworkLoggerConfig {
  maxRequests?: number;
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
  originalXHRSetRequestHeader?: typeof XMLHttpRequest.prototype.setRequestHeader;
}

const builtinFilters: RequestFilter[] = [
  (request: NetworkRequest): boolean => request.method.toLowerCase() !== "head",
  (request: NetworkRequest): boolean =>
    !shouldIgnoreLocalHostUrls(request.url) &&
    !shouldIgnoreLocalHostUrls(request.fullUrl || ""),
];

const applyFilters = (
  request: NetworkRequest,
  filters: RequestFilter[]
): boolean => {
  return filters.every((filter) => filter(request));
};

const defaultConfig: NetworkLoggerConfig = {
  maxRequests: 1000,
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

const shouldIgnoreLocalHostUrls = (url: string): boolean => {
  const localPatterns = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "192.168.",
    "10.0.",
    "172.16.",
    "file://",
  ];

  return localPatterns.some((pattern) =>
    url.toLowerCase().includes(pattern.toLowerCase())
  );
};

const addRequest = (request: NetworkRequest): void => {
  if (!applyFilters(request, builtinFilters)) {
    return;
  }

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

const parseBodySync = (body: any): any => {
  if (body === undefined || body === null) return undefined;

  if (typeof body === "string") {
    const trimmed = body.trim();
    if (trimmed.length === 0) return undefined;
    return body;
  }
  if (body instanceof FormData) return "[FormData]";
  if (body instanceof ArrayBuffer) return "[ArrayBuffer]";
  if (body instanceof Blob) return "[Blob]";

  try {
    return JSON.stringify(body);
  } catch {
    return String(body);
  }
};

const createXHRInterceptor = () => {
  if (!networkLoggerState.originalXHROpen) {
    networkLoggerState.originalXHROpen = XMLHttpRequest.prototype.open;
    networkLoggerState.originalXHRSend = XMLHttpRequest.prototype.send;
    networkLoggerState.originalXHRSetRequestHeader =
      XMLHttpRequest.prototype.setRequestHeader;
  }

  XMLHttpRequest.prototype.setRequestHeader = function (
    name: string,
    value: string
  ) {
    const loggerData = (this as any)._networkLogger;
    if (loggerData && loggerData.headers) {
      loggerData.headers[name] = value;
    }
    return networkLoggerState.originalXHRSetRequestHeader!.call(
      this,
      name,
      value
    );
  };

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
      headers: {},
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
      const request: NetworkRequest = {
        id: loggerData.id,
        method: loggerData.method,
        url: loggerData.url,
        fullUrl: loggerData.url,
        headers: loggerData.headers,
        body: parseBodySync(body),
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
          try {
            if (this.responseType === "" || this.responseType === "text") {
              responseBody = this.responseText
                ? JSON.parse(this.responseText)
                : `${this.responseText}`;
            } else if (this.responseType === "blob" && this.response) {
              try {
                const blob = this.response as Blob;
                if (blob.size === 0) {
                  responseBody = `[EMPTY BLOB: ${blob.type || "unknown"}]`;
                } else if (blob.size < 10000 && blob.type.startsWith("text/")) {
                  responseBody = `[TEXT BLOB: ${blob.size} bytes]`;
                } else if (blob.size < 10000) {
                  responseBody = `[BLOB: ${blob.type || "unknown"}, ${
                    blob.size
                  } bytes]`;
                } else {
                  responseBody = `[BLOB: ${blob.type || "unknown"}, ${
                    blob.size
                  } bytes - too large]`;
                }
              } catch {
                responseBody = "[BLOB DATA]";
              }
            } else {
              responseBody = `[${this.responseType.toUpperCase()} DATA]`;
            }
          } catch {
            try {
              responseBody =
                this.responseType === "" || this.responseType === "text"
                  ? String(this.responseText || "")
                  : `[${this.responseType.toUpperCase()} DATA]`;
            } catch {
              responseBody = "[RESPONSE_UNAVAILABLE]";
            }
          }

          const responseHeaders: Record<string, string> = {};
          try {
            const allHeaders = this.getAllResponseHeaders();
            if (allHeaders) {
              allHeaders.split("\r\n").forEach((line) => {
                const parts = line.split(": ");
                if (parts.length === 2 && parts[0] && parts[1]) {
                  responseHeaders[parts[0]] = parts[1];
                }
              });
            }
          } catch {}

          updateRequest(loggerData.id, {
            status: this.status,
            response: responseBody,
            responseHeaders: responseHeaders,
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

const startLogging = (): void => {
  if (networkLoggerState.isActive) return;

  createXHRInterceptor();

  networkLoggerState.isActive = true;
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

  if (networkLoggerState.originalXHRSetRequestHeader) {
    XMLHttpRequest.prototype.setRequestHeader =
      networkLoggerState.originalXHRSetRequestHeader;
  }

  networkLoggerState.isActive = false;
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
};
