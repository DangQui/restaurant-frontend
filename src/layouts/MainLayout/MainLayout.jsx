// src/layouts/MainLayout/MainLayout.jsx
import React, { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/store/AuthContext'
import ChatWidget from "@/components/ChatWidget/ChatWidget";

import Header from './Header'
import Footer from './Footer'
import styles from './MainLayout.module.scss'

const MainLayout = () => {
  const { user } = useAuthContext()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // ✅ Nếu đã đăng nhập & là ADMIN & đang ở trang chủ → đẩy sang admin dashboard
    if (user?.role === 'ADMIN' && location.pathname === '/') {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [user, location.pathname, navigate])

  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

export default MainLayout











