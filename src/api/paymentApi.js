// src/api/paymentApi.js
import { axiosClient } from './axiosClient'

// Lấy danh sách payment (nếu sau này cần xem lịch sử thanh toán)
export const getPayments = (params) =>
    axiosClient.get('orders/payments', { params }).then((res) => res.data)

// Tạo payment mới
export const createPayment = (data) =>
    axiosClient.post('orders/payments', data).then((res) => res.data)

// Cập nhật payment (status)
export const updatePayment = (id, data) =>
    axiosClient.put(`orders/payments/${id}`, data).then((res) => res.data)
