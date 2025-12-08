const AUTH_BASE_URL = (
  import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:3003"
).replace(/(?<!:)\/\/+/g, "/");

const request = async (method, path, body) => {
  const response = await fetch(`${AUTH_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.error || payload.message || "Request failed";
    throw new Error(message);
  }

  return response.json();
};

export const authService = {
  login: (credentials) => request("POST", "/login", credentials),
  register: (payload) => request("POST", "/register", payload),
};
