import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/store/AuthContext'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, authLoading } = useAuthContext()
    const location = useLocation()

    if (authLoading) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: '#e5e7eb' }}>
                Đang kiểm tra đăng nhập...
            </div>
        )
    }

    if (!user) {
        // Nếu muốn mở modal thay vì chuyển route, bạn có thể sửa logic này sau.
        return <Navigate to="/" state={{ from: location }} replace />
    }

    if (requireAdmin && user.role !== 'ADMIN') {
        return <Navigate to="/" replace />
    }
    

    return children
}

export default ProtectedRoute
