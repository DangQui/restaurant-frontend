// src/api/orderApi.js
import { axiosClient } from './axiosClient'

// Lấy tất cả orders, có filter query (orderType, status, tableId, userId,...)
// API Gateway đã có prefix /orders, nên chỉ cần gọi /orders (không cần /orders/orders)
export const getOrders = (params) =>
    axiosClient.get('/orders/orders', { params }).then((res) => res.data)

export const getOrderById = (id) =>
    axiosClient.get(`/orders/orders/${id}`).then((res) => res.data)

export const createOrder = (data) =>
    axiosClient.post('/orders/orders', data).then((res) => res.data)

export const updateOrder = (id, data) =>
    axiosClient.put(`/orders/orders/${id}`, data).then((res) => res.data)

export const deleteOrder = (id) =>
    axiosClient.delete(`/orders/orders/${id}`).then((res) => res.data)

// -------- Order Items ----------
export const addOrderItem = (orderId, data) =>
    axiosClient.post(`/orders/orders/${orderId}/items`, data).then((res) => res.data)

export const updateOrderItem = (orderId, itemId, data) =>
    axiosClient
        .put(`/orders/${orderId}/items/${itemId}`, data)
        .then((res) => res.data)

export const deleteOrderItem = (orderId, itemId) =>
    axiosClient
        .delete(`/orders/${orderId}/items/${itemId}`)
        .then((res) => res.data)

export const getMenuItems = (params) =>
    axiosClient
        .get('/orders/menu-items', { params })
        .then((res) => res.data.data || []) 