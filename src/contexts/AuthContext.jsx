// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { getMeApi, loginApi, registerApi } from '@/api/authApi'
import { axiosClient } from '@/api/axiosClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)

    // Khi app load, đọc token từ localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('access_token')
        const savedUser = localStorage.getItem('current_user')

        if (savedToken) {
            setToken(savedToken)
            axiosClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
        }

        if (savedUser) {
            setUser(JSON.parse(savedUser))
            setAuthLoading(false)
        } else if (savedToken) {
            // Nếu có token nhưng chưa có user -> gọi /auth/me (nếu BE hỗ trợ)
            ; (async () => {
                try {
                    const me = await getMeApi()
                    setUser(me)
                    localStorage.setItem('current_user', JSON.stringify(me))
                } catch (err) {
                    console.error('getMe failed:', err)
                    handleLogout()
                } finally {
                    setAuthLoading(false)
                }
            })()
        } else {
            setAuthLoading(false)
        }
    }, [])

    const handleLogin = async (email, password) => {
        const res = await loginApi({ email, password })

        // Giả sử BE trả { token, user }
        const accessToken = res.token || res.accessToken
        const loginUser = res.user || res.data || res

        if (accessToken) {
            setToken(accessToken)
            axiosClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
            localStorage.setItem('access_token', accessToken)
        }

        if (loginUser) {
            setUser(loginUser)
            localStorage.setItem('current_user', JSON.stringify(loginUser))
        }

        return loginUser
    }

    const handleRegister = async (payload) => {
        // payload: { name, email, password, ... }
        const res = await registerApi(payload)
        return res
    }

    const handleLogout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('current_user')
        delete axiosClient.defaults.headers.common['Authorization']
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                authLoading,
                login: handleLogin,
                register: handleRegister,
                logout: handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
