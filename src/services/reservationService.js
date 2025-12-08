// API client riêng cho reservation service
const RESERVATION_BASE_URL = (
  import.meta.env.VITE_RESERVATION_SERVICE_URL || "http://localhost:3002"
).replace(/(?<!:)\/\/+/g, "/");

// Lấy token từ localStorage (đồng bộ với AuthContext)
// const getAuthToken = () => {
//   try {
//     const stored = localStorage.getItem("wowwraps_auth");
//     if (stored) {
//       const parsed = JSON.parse(stored);
//       return parsed?.token || null;
//     }
//   } catch {
//     return null;
//   }
//   return null;
// };
const getAuthToken = () => {
  return localStorage.getItem('access_token')
}

const buildHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  console.log('token', token);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const buildUrl = (path, params) => {
  const sanitizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(
    sanitizedPath,
    RESERVATION_BASE_URL.endsWith("/")
      ? RESERVATION_BASE_URL
      : `${RESERVATION_BASE_URL}/`
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

// const request = async (method, path, { params, body } = {}) => {
//   const url = buildUrl(path, params);

//   console.log('[reservationService] Request:', method, url.toString(), { body });

//   const response = await fetch(url, {
//     method,
//     headers: buildHeaders(),
//     body: body ? JSON.stringify(body) : undefined,
//   });

//   const text = await response.text(); // đọc raw text

//   if (!response.ok) {
//     console.error('[reservationService] Error response:', response.status, text);

//     let errorPayload = {};
//     try {
//       errorPayload = JSON.parse(text);
//     } catch { }

//     const message =
//       errorPayload.error ||
//       errorPayload.message ||
//       `Request failed with status ${response.status}`;

//     throw new Error(message);
//   }

//   if (!text) return null;
//   return JSON.parse(text);
// };


const reservationApiClient = {
  get: (path, options) => request("GET", path, options),
  post: (path, options) => request("POST", path, options),
  put: (path, options) => request("PUT", path, options),
  delete: (path, options) => request("DELETE", path, options),
};

/**
 * Lấy danh sách bàn trống theo ngày, giờ và số người
 * @param {string} date - Ngày (YYYY-MM-DD)
 * @param {string} time - Giờ (HH:mm)
 * @param {number} partySize - Số người
 * @returns {Promise<Array>} Danh sách bàn trống
 */
export const getAvailableTables = async (date, time, partySize) => {
  try {
    const tables = await reservationApiClient.get("/available-tables", {
      params: {
        date,
        time,
        partySize: partySize.toString(),
      },
    });
    return tables;
  } catch (error) {
    console.error("[reservationService] Lỗi lấy danh sách bàn:", error);
    throw new Error(
      error.message || "Không thể lấy danh sách bàn. Vui lòng thử lại."
    );
  }
};

/**
 * Tạo đặt bàn mới
 * @param {Object} payload - Thông tin đặt bàn
 * @param {string} payload.customerName - Tên khách hàng
 * @param {string} payload.customerPhone - Số điện thoại
 * @param {number} payload.tableNumber - Số bàn
 * @param {number} payload.partySize - Số người
 * @param {string} payload.reservationDate - Ngày đặt (YYYY-MM-DD)
 * @param {string} payload.reservationTime - Giờ đặt (HH:mm)
 * @param {number} payload.durationMinutes - Thời lượng (phút, mặc định 120)
 * @param {string} payload.notes - Ghi chú
 * @returns {Promise<Object>} Đặt bàn đã tạo
 */
export const createReservation = async (payload) => {
  try {
    const {
      customerName,
      customerPhone,
      tableNumber,
      partySize,
      reservationDate,
      reservationTime,
      durationMinutes = 120,
      notes,
    } = payload;

    const reservation = await reservationApiClient.post("/", {
      body: {
        customerName,
        customerPhone,
        tableNumber: parseInt(tableNumber, 10),
        partySize: parseInt(partySize, 10),
        reservationDate,
        reservationTime,
        durationMinutes,
        notes: notes || "",
        status: 'pending',
      },
    });

    return reservation;
  } catch (error) {
    console.error("[reservationService] Lỗi tạo đặt bàn:", error);
    throw new Error(
      error.message || "Không thể tạo đặt bàn. Vui lòng thử lại."
    );
  }
};

export const reservationService = {
  getAvailableTables,
  createReservation,
};

export default reservationService;
