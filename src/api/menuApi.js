import { axiosClient } from './axiosClient'

// Lấy danh sách món (trả thẳng ra array)
export const getMenuItems = (params) =>
    axiosClient
        .get('/orders/menu-items', { params })
        .then((res) => res.data)

// Lấy 1 món (nếu cần)
export const getMenuItemById = (id) =>
    axiosClient
        .get(`/orders/menu-items/${id}`)
        .then((res) => res.data.data || res.data)

// Tạo món mới
export const createMenuItem = (data) =>
    axiosClient
        .post('/orders/menu-items', data)
        .then((res) => res.data.data || res.data)

// Cập nhật món
export const updateMenuItem = (id, data) =>
    axiosClient
        .put(`/orders/menu-items/${id}`, data)
        .then((res) => res.data.data || res.data)

// Xóa món
export const deleteMenuItem = (id) =>
    axiosClient
        .delete(`/orders/menu-items/${id}`)
        .then((res) => res.data)