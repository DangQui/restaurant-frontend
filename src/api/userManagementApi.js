// src/api/userManagementApi.js
import { axiosClient } from './axiosClient'

// Lấy danh sách user
export const getUsers = (params) =>
    axiosClient.get('/auth/users', { params }).then((res) => res.data)

// Tạo user mới (admin thêm nhân viên)
export const createUser = (data) =>
    axiosClient.post('/auth/users', data).then((res) => res.data)

// Cập nhật user (role, name, ...)
export const updateUser = (id, data) =>
    axiosClient.put(`/auth/users/${id}`, data).then((res) => res.data)

// Xóa user
export const deleteUser = (id) =>
    axiosClient.delete(`/auth/users/${id}`).then((res) => res.data)
