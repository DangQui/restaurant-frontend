// src/api/authApi.js
import { axiosClient } from './axiosClient'

// Đăng nhập
export const loginApi = (data) =>
    axiosClient.post('/auth/login', data).then((res) => res.data)

// Đăng ký
export const registerApi = (data) =>
    axiosClient.post('/auth/register', data).then((res) => res.data)

// Lấy thông tin user hiện tại (nếu BE có)
export const getMeApi = () =>
    axiosClient.get('/auth/me').then((res) => res.data)
