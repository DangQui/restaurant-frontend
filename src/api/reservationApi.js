// src/api/reservationApi.js
import { axiosClient } from './axiosClient'

// Nếu backend mount router là app.use('/api/reservations', ...)
// thì ở đây chỉ cần '/reservations'
const BASE_URL = '/reservations'

// Lấy tất cả reservations (có filter ?status=pending,...)
export const getReservations = (params) =>
    axiosClient.get(BASE_URL, { params }).then((res) => res.data)

// Lấy chi tiết 1 reservation
export const getReservationById = (id) =>
    axiosClient.get(`${BASE_URL}/${id}`).then((res) => res.data)

// Tạo reservation (USER hoặc ADMIN)
export const createReservation = (data) =>
    axiosClient.post(BASE_URL, data).then((res) => res.data)

// Cập nhật reservation (thường là status)
export const updateReservation = (id, data) =>
    axiosClient.put(`${BASE_URL}/${id}`, data).then((res) => res.data)

// Xoá reservation
export const deleteReservation = (id) =>
    axiosClient.delete(`${BASE_URL}/${id}`).then((res) => res.data)

// Lấy danh sách bàn trống theo date + time + partySize
export const getAvailableTables = (params) =>
    axiosClient
        .get(`${BASE_URL}/available-tables`, { params })
        .then((res) => res.data)
