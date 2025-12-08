// src/layouts/AdminLayout/AdminLayout.jsx
import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/store/AuthContext'

const AdminLayout = () => {
    // const { user, logout } = useAuth()
    const { user, logout } = useAuthContext() || {}

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: '#e5e7eb' }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: 230,
                    borderRight: '1px solid #1f2937',
                    padding: 16,
                    background: '#020617',
                }}
            >
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Admin Panel</h2>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                    <NavLink
                        to="/admin/dashboard"
                        style={({ isActive }) => ({
                            padding: '8px 10px',
                            borderRadius: 8,
                            textDecoration: 'none',
                            color: isActive ? '#f97316' : '#e5e7eb',
                            background: isActive ? '#111827' : 'transparent',
                        })}
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/tables"
                        style={({ isActive }) => ({
                            padding: '8px 10px',
                            borderRadius: 8,
                            textDecoration: 'none',
                            color: isActive ? '#f97316' : '#e5e7eb',
                            background: isActive ? '#111827' : 'transparent',
                        })}
                    >
                        Bàn
                    </NavLink>
                    <NavLink
                        to="/admin/orders"
                        style={({ isActive }) => ({
                            padding: '8px 10px',
                            borderRadius: 8,
                            textDecoration: 'none',
                            color: isActive ? '#f97316' : '#e5e7eb',
                            background: isActive ? '#111827' : 'transparent',
                        })}
                    >
                        Đơn hàng
                    </NavLink>

                    <NavLink
                        to="/admin/reservations"
                        style={({ isActive }) => ({
                            padding: '8px 10px',
                            borderRadius: 8,
                            textDecoration: 'none',
                            color: isActive ? '#f97316' : '#e5e7eb',
                            background: isActive ? '#111827' : 'transparent',
                        })}
                    >
                        Đặt bàn
                    </NavLink>
                    <NavLink
                        to="/admin/menu"
                        style={({ isActive }) => ({
                            padding: '8px 10px',
                            borderRadius: 8,
                            textDecoration: 'none',
                            color: isActive ? '#f97316' : '#e5e7eb',
                            background: isActive ? '#111827' : 'transparent',
                        })}
                    >
                        Thực đơn
                    </NavLink>
                    <NavLink
                        to="/admin/users"
                        style={({ isActive }) => ({
                            padding: '8px 10px',
                            borderRadius: 8,
                            textDecoration: 'none',
                            color: isActive ? '#f97316' : '#e5e7eb',
                            background: isActive ? '#111827' : 'transparent',
                        })}
                    >
                        Người dùng
                    </NavLink>
                </nav>

                <div style={{ marginTop: 'auto', marginTop: 40, fontSize: 13, color: '#9ca3af' }}>
                    {user && (
                        <>
                            <div style={{ marginBottom: 6 }}>Xin chào, {user.name || user.email}</div>
                            <button
                                onClick={logout}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 9999,
                                    border: '1px solid #ef4444',
                                    background: 'transparent',
                                    color: '#fecaca',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                }}
                            >
                                Đăng xuất
                            </button>
                        </>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, padding: 20 }}>
                <Outlet />
            </main>
        </div>
    )
}

export default AdminLayout
