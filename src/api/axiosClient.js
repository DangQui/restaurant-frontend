// src/api/axiosClient.js
import axios from 'axios'

const API_GATEWAY_URL =
    (import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5055').replace(
        /\/+$/,
        ''
    )

// Lấy token từ localStorage (tuỳ bạn đang lưu key nào)
const getToken = () => {
    return localStorage.getItem('token') // nếu bạn dùng key khác thì đổi ở đây
}

export const axiosClient = axios.create({
    baseURL: API_GATEWAY_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Gắn Authorization tự động
axiosClient.interceptors.request.use(
    (config) => {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)
