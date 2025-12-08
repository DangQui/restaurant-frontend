// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import { toast } from "sonner";
// import { authService } from "@/services/authService";
// import { setAuthToken } from "@/services/apiClient";

// const STORAGE_KEY = "wowwraps_auth";

// const AuthContext = createContext(null);

// const readStoredSession = () => {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (!raw) return null;
//     return JSON.parse(raw);
//   } catch {
//     return null;
//   }
// };

// const persistSession = (payload) => {
//   if (!payload) {
//     localStorage.removeItem(STORAGE_KEY);
//     return;
//   }
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
// };

// export const AuthProvider = ({ children }) => {
//   const [state, setState] = useState({
//     user: null,
//     token: null,
//     loading: true,
//   });
//   const [authModalOpen, setAuthModalOpen] = useState(false);
//   const [authView, setAuthView] = useState("login");

//   useEffect(() => {
//     const saved = readStoredSession();
//     if (saved?.token && saved?.user) {
//       setAuthToken(saved.token);
//       // eslint-disable-next-line react-hooks/set-state-in-effect
//       setState({ user: saved.user, token: saved.token, loading: false });
//     } else {
//       setState((prev) => ({ ...prev, loading: false }));
//     }
//   }, []);

//   const saveSession = useCallback((payload) => {
//     persistSession(payload);
//     setAuthToken(payload?.token || null);
//     setState({
//       user: payload?.user || null,
//       token: payload?.token || null,
//       loading: false,
//     });
//   }, []);

//   const handleLogin = useCallback(
//     async (credentials) => {
//       try {
//         const data = await authService.login(credentials);
//         saveSession(data);
//         setAuthModalOpen(false);
//         toast.success("Đăng nhập thành công", {
//           description: `Chào mừng trở lại, ${
//             data.user?.name || data.user?.email
//           }`,
//         });
//       } catch (error) {
//         toast.error("Đăng nhập thất bại", {
//           description: error.message,
//         });
//         throw error;
//       }
//     },
//     [saveSession]
//   );

//   const handleRegister = useCallback(
//     async (payload) => {
//       try {
//         const data = await authService.register(payload);
//         saveSession(data);
//         setAuthModalOpen(false);
//         toast.success("Đăng ký thành công", {
//           description: "Tài khoản của bạn đã được tạo và đăng nhập.",
//         });
//       } catch (error) {
//         toast.error("Đăng ký thất bại", {
//           description: error.message,
//         });
//         throw error;
//       }
//     },
//     [saveSession]
//   );

//   const logout = useCallback(() => {
//     saveSession(null);
//     toast("Bạn đã đăng xuất");
//   }, [saveSession]);

//   const openAuthModal = useCallback((view = "login") => {
//     setAuthView(view);
//     setAuthModalOpen(true);
//   }, []);

//   const value = useMemo(
//     () => ({
//       user: state.user,
//       token: state.token,
//       isAuthenticated: Boolean(state.token),
//       loading: state.loading,
//       login: handleLogin,
//       register: handleRegister,
//       logout,
//       authModalOpen,
//       authView,
//       setAuthView,
//       openAuthModal,
//       closeAuthModal: () => setAuthModalOpen(false),
//     }),
//     [
//       authModalOpen,
//       authView,
//       handleLogin,
//       handleRegister,
//       logout,
//       openAuthModal,
//       state.loading,
//       state.token,
//       state.user,
//     ]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// // eslint-disable-next-line react-refresh/only-export-components
// export const useAuthContext = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuthContext must be used within AuthProvider");
//   }
//   return context;
// };






// src/store/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { loginApi, registerApi, getMeApi } from '@/api/authApi'
import { axiosClient } from '@/api/axiosClient'
import { setAuthToken } from '@/services/apiClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // state cho modal
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authView, setAuthView] = useState('login') // 'login' | 'register'

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('current_user')
    delete axiosClient.defaults.headers.common['Authorization']
    // Xóa token khỏi apiClient
    setAuthToken(null)
  }

  // Khi app load, đọc token + user từ localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('current_user')

    if (savedToken) {
      setToken(savedToken)
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
      // Đồng bộ token vào apiClient
      setAuthToken(savedToken)
    }

    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setAuthLoading(false)
    } else if (savedToken) {
      ; (async () => {
        try {
          const me = await getMeApi() // nếu BE có /auth/me
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

  // mở / đóng modal
  const openAuthModal = (view = 'login') => {
    setAuthView(view)
    setAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setAuthModalOpen(false)
  }

  // LOGIN: nhận { email, password } (đúng kiểu AuthDialog đang gửi)
  const login = async ({ email, password }) => {
    const res = await loginApi({ email, password }) // tuỳ authApi của bạn

    // BE có thể trả { token, user } hoặc { accessToken, user } tuỳ
    const accessToken = res.token || res.accessToken
    const loginUser = res.user || res.data || res

    if (accessToken) {
      setToken(accessToken)
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      localStorage.setItem('access_token', accessToken)
      // Đồng bộ token vào apiClient
      setAuthToken(accessToken)
    }

    if (loginUser) {
      setUser(loginUser)
      localStorage.setItem('current_user', JSON.stringify(loginUser))
    }

    closeAuthModal()
    return loginUser
  }

  // REGISTER: nhận { name, email, password }
  const register = async ({ name, email, password }) => {
    const res = await registerApi({ name, email, password })

    // Backend đã trả token và user, tự động đăng nhập luôn
    const accessToken = res.token || res.accessToken
    const registerUser = res.user || res.data || res

    if (accessToken) {
      setToken(accessToken)
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      localStorage.setItem('access_token', accessToken)
      // Đồng bộ token vào apiClient
      setAuthToken(accessToken)
    }

    if (registerUser) {
      setUser(registerUser)
      localStorage.setItem('current_user', JSON.stringify(registerUser))
    }

    closeAuthModal()
    return registerUser
  }

  return (
    <AuthContext.Provider
      value={{
        // auth state
        user,
        token,
        authLoading,
        isAuthenticated: Boolean(token),
        // auth actions
        login,
        register,
        logout: handleLogout,
        // modal state
        authModalOpen,
        authView,
        setAuthView,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
