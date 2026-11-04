/**
 * Base HTTP API Client for Library Hub Nawalpur.
 * Uses native fetch with standard error handling, query parameters, and timeout support.
 * Configured to read the base URL from VITE_API_BASE_URL.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const DEFAULT_TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Perform an HTTP request with built-in timeout, JSON parsing, and error formatting.
 */
async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    params,
    timeout = DEFAULT_TIMEOUT_MS,
    ...customConfig
  } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    signal: controller.signal,
    ...customConfig,
  };

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Parse response
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.message || response.statusText || 'Request failed';
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your connection.', 408);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error.message || 'Network error occurred', 500);
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;

