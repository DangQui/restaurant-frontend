// src/pages/Admin/UsersPage.jsx
import React, { useEffect, useState } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/userManagementApi'

const ROLE_OPTIONS = ['ADMIN', 'STAFF', 'USER']

const UsersPage = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER',
    })
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    // 🆕 State cho phân trang
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 7,        // giống limit backend trả
        total: 0,
        totalPages: 1,
    })

    // 🆕 Hàm fetch có param page
    const fetchData = async (page = 1) => {
        try {
            setLoading(true)
            setError(null)

            // 👉 Tùy getUsers định nghĩa mà bạn gọi:
            // Nếu getUsers nhận params: getUsers({ page, limit })
            const res = await getUsers({ page, limit: pagination.limit })

            // res = { data: [...], pagination: {...} }
            const list = Array.isArray(res?.data) ? res.data : []
            setUsers(list)

            if (res?.pagination) {
                setPagination((prev) => ({
                    ...prev,
                    ...res.pagination, // { total, page, limit, totalPages }
                }))
            }
        } catch (err) {
            console.error(err)
            setError(err.message || 'Không tải được danh sách người dùng')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const openCreate = () => {
        setEditing(null)
        setForm({
            name: '',
            email: '',
            password: '',
            role: 'USER',
        })
        setShowModal(true)
    }

    const openEdit = (user) => {
        setEditing(user)
        setForm({
            name: user.name || '',
            email: user.email || '',
            password: '',
            role: user.role || 'USER',
        })
        setShowModal(true)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setSaving(true)
            setError(null)

            const payload = {
                name: form.name,
                email: form.email,
                role: form.role,
            }

            if (!editing || form.password) {
                payload.password = form.password
            }

            if (editing) {
                await updateUser(editing.id, payload)
            } else {
                await createUser(payload)
            }

            setShowModal(false)
            setEditing(null)
            // 🆕 Sau khi lưu xong, load lại page hiện tại
            await fetchData(pagination.page)
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.message || 'Lưu người dùng thất bại')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return
        try {
            setDeletingId(id)
            await deleteUser(id)
            // 🆕 Load lại page hiện tại
            await fetchData(pagination.page)
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.message || 'Xóa người dùng thất bại')
        } finally {
            setDeletingId(null)
        }
    }

    const filtered = users.filter((u) => {
        const q = search.toLowerCase()
        return (
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        )
    })

    // 🆕 Đổi trang
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return
        fetchData(newPage)
    }

    return (
        <div>
            <h1 style={{ marginBottom: 16, color: '#f9fafb' }}>Quản lý người dùng</h1>

            {error && (
                <div
                    style={{
                        marginBottom: 12,
                        padding: 8,
                        borderRadius: 8,
                        border: '1px solid #ef4444',
                        background: 'rgba(239,68,68,0.1)',
                        color: '#fecaca',
                        fontSize: 13,
                    }}
                >
                    {error}
                </div>
            )}

            {/* Toolbar */}
            <div
                style={{
                    marginBottom: 16,
                    padding: 12,
                    borderRadius: 12,
                    background: '#020617',
                    border: '1px solid #1f2937',
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#e5e7eb',
                }}
            >
                <input
                    type="text"
                    placeholder="Tìm theo tên, email, role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: 1,
                        minWidth: 220,
                        padding: '8px 10px',
                        borderRadius: 9999,
                        border: '1px solid #334155',
                        background: '#020617',
                        color: '#e5e7eb',
                        fontSize: 14,
                    }}
                />
                <button
                    onClick={openCreate}
                    style={{
                        padding: '8px 16px',
                        borderRadius: 9999,
                        border: 'none',
                        background: '#f97316',
                        color: '#020617',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    ➕ Thêm user
                </button>
            </div>

            {/* Table */}
            <div
                style={{
                    background: '#020617',
                    borderRadius: 12,
                    border: '1px solid #1f2937',
                    padding: 16,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    color: '#e5e7eb',
                }}
            >
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: 14,
                        }}
                    >
                        <thead>
                            <tr style={{ background: '#020617' }}>
                                {['ID', 'Tên', 'Email', 'Role', 'Thao tác'].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: '10px 8px',
                                            borderBottom: '1px solid #1f2937',
                                            textAlign: 'left',
                                            fontWeight: 600,
                                            color: '#9ca3af',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && !loading && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        style={{
                                            padding: 16,
                                            textAlign: 'center',
                                            color: '#6b7280',
                                        }}
                                    >
                                        Không có user nào
                                    </td>
                                </tr>
                            )}

                            {loading && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        style={{
                                            padding: 16,
                                            textAlign: 'center',
                                            color: '#6b7280',
                                        }}
                                    >
                                        Đang tải...
                                    </td>
                                </tr>
                            )}

                            {filtered.map((u, idx) => (
                                <tr
                                    key={u.id}
                                    style={{
                                        background: idx % 2 === 0 ? '#020617' : '#030712',
                                    }}
                                >
                                    <td
                                        style={{
                                            borderBottom: '1px solid #1f2937',
                                            padding: '10px 8px',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        #{u.id}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: '1px solid #1f2937',
                                            padding: '10px 8px',
                                            maxWidth: 200,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                        title={u.name}
                                    >
                                        {u.name}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: '1px solid #1f2937',
                                            padding: '10px 8px',
                                            maxWidth: 230,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            color: '#93c5fd',
                                        }}
                                        title={u.email}
                                    >
                                        {u.email}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: '1px solid #1f2937',
                                            padding: '10px 8px',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                padding: '3px 10px',
                                                borderRadius: 9999,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                background: 'rgba(56,189,248,0.12)',
                                                color: '#38bdf8',
                                            }}
                                        >
                                            {u.role}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: '1px solid #1f2937',
                                            padding: '10px 8px',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <button
                                            onClick={() => openEdit(u)}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: 9999,
                                                border: '1px solid #3b82f6',
                                                background: 'transparent',
                                                color: '#60a5fa',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                marginRight: 6,
                                            }}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            disabled={deletingId === u.id}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: 9999,
                                                border: '1px solid #ef4444',
                                                background:
                                                    deletingId === u.id ? 'rgba(248,113,113,0.15)' : 'transparent',
                                                color: '#fca5a5',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                cursor: deletingId === u.id ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {deletingId === u.id ? 'Đang xóa...' : 'Xóa'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 🆕 Thanh phân trang */}
                <div
                    style={{
                        marginTop: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 13,
                        color: '#9ca3af',
                    }}
                >
                    <span>
                        Trang {pagination.page}/{pagination.totalPages} — Tổng {pagination.total} user
                    </span>

                    <div style={{ display: 'flex', gap: 6 }}>
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            style={{
                                padding: '4px 10px',
                                borderRadius: 9999,
                                border: '1px solid #4b5563',
                                background: pagination.page <= 1 ? '#111827' : '#020617',
                                color: '#e5e7eb',
                                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            ◀ Trước
                        </button>

                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            style={{
                                padding: '4px 10px',
                                borderRadius: 9999,
                                border: '1px solid #4b5563',
                                background:
                                    pagination.page >= pagination.totalPages ? '#111827' : '#020617',
                                color: '#e5e7eb',
                                cursor:
                                    pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Sau ▶
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal thêm/sửa user */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(3px)',
                        animation: 'fadeIn 0.2s ease-in-out',
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            width: 'min(520px, 95vw)',
                            maxHeight: '90vh',
                            padding: '24px 32px',
                            overflowY: 'auto',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                            animation: 'slideUp 0.3s ease',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ margin: '0 0 20px', fontSize: 24, fontWeight: 700, color: '#111827' }}>
                            {editing ? 'Sửa người dùng' : 'Thêm người dùng'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            {/* Name */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
                                    Họ tên
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
                                    Mật khẩu {editing && <span style={{ fontWeight: 400, color: '#6b7280' }}>(để trống nếu không đổi)</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>

                            {/* Role */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151' }}>
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        background: '#fff',
                                        color: '#111827',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                >
                                    {ROLE_OPTIONS.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        background: '#f3f4f6',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        color: "#0b0b0bff"
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
                                    onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: '#2563eb',
                                        color: '#fff',
                                        fontWeight: 600,
                                        cursor: saving ? 'default' : 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => !saving && (e.target.style.background = '#1d4ed8')}
                                    onMouseLeave={(e) => !saving && (e.target.style.background = '#2563eb')}
                                >
                                    {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Keyframe animations */}
                    <style>
                        {`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}
                    </style>
                </div>
            )}

        </div>
    )
}

export default UsersPage
