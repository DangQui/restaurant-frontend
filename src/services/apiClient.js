const BASE_URL = (
  import.meta.env.VITE_ORDER_SERVICE_URL || "http://localhost:3001"
).replace(/(?<!:)\/\/+/g, "/");

let AUTH_TOKEN = null;

// Đồng bộ token từ localStorage khi module được load
const initToken = () => {
  try {
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      AUTH_TOKEN = savedToken;
    }
  } catch (error) {
    console.warn('Failed to load token from localStorage:', error);
  }
};

// Khởi tạo token ngay khi module được load
initToken();

export const setAuthToken = (token) => {
  AUTH_TOKEN = token || null;
  if (token) {
    try {
      localStorage.setItem('access_token', token);
    } catch (error) {
      console.warn('Failed to save token to localStorage:', error);
    }
  } else {
    try {
      localStorage.removeItem('access_token');
    } catch (error) {
      console.warn('Failed to remove token from localStorage:', error);
    }
  }
};

const buildHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  // Lấy token từ localStorage mỗi lần request để đảm bảo luôn có token mới nhất
  const token = AUTH_TOKEN || localStorage.getItem('access_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const buildUrl = (path, params) => {
  const sanitizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(
    sanitizedPath,
    BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`
  );

  if (params) {
    Object.entries(params)
      .filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
      .forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
  }

  return url;
};

const request = async (method, path, { params, body } = {}) => {
  const response = await fetch(buildUrl(path, params), {
    method,
    headers: buildHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message =
      errorPayload.error || errorPayload.message || "Request failed";
    throw new Error(message);
  }

  return response.json();
};

export const apiClient = {
  get: (path, options) => request("GET", path, options),
  post: (path, options) => request("POST", path, options),
  put: (path, options) => request("PUT", path, options),
  patch: (path, options) => request("PATCH", path, options),
  delete: (path, options) => request("DELETE", path, options),
};
