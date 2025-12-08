// src/pages/Admin/MenuItemsPage.jsx
import React, { useEffect, useState } from 'react'
import {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} from '@/api/menuApi'

// Bổ sung type / category cho khớp data thực tế
const TYPE_OPTIONS = ['food', 'drink', 'dessert', 'other']
const CATEGORY_OPTIONS = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
    'starters',
    'dessert',
    'drink',
    'other',
]

const PAGE_SIZE = 10

const MenuItemsPage = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [form, setForm] = useState({
        name: '',
        price: '',
        category: '',
        type: '',
        description: '',
        // imageUrl: '',
    })
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    // phân trang
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1,
    })

    const fetchItems = async (pageParam = page) => {
        try {
            setLoading(true)
            setError(null)

            const res = await getMenuItems({
                page: pageParam,
                limit: PAGE_SIZE,
            })
            // res = { data: [...], pagination: {...}, fromCache: false }

            const list = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res)
                    ? res
                    : []

            setItems(list)

            const pg = res?.pagination
            if (pg) {
                const total = pg.total ?? list.length
                const totalPages =
                    pg.totalPages ?? Math.ceil(total / (pg.limit || PAGE_SIZE))

                setPagination({
                    total,
                    totalPages,
                })
                setPage(pg.page ?? pageParam)
            } else {
                // fallback khi BE không trả pagination
                setPagination({
                    total: list.length,
                    totalPages: 1,
                })
                setPage(1)
            }
        } catch (err) {
            console.error(err)
            setError(err.message || 'Không tải được danh sách món')
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchItems(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const openCreate = () => {
        setEditingItem(null)
        setForm({
            name: '',
            price: '',
            category: '',
            type: '',
            description: '',
            // imageUrl: '',
        })
        setShowModal(true)
    }

    const openEdit = (item) => {
        setEditingItem(item)
        setForm({
            name: item.name || '',
            price: item.price || '',
            category: item.category || '',
            type: item.type || '',
            description: item.description || '',
            imageUrl: item.imageUrl || '',
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
                price: Number(form.price) || 0,
                category: form.category || null,
                type: form.type || null,
                description: form.description || null,
                imageUrl: form.imageUrl || null,
            }

            if (editingItem) {
                await updateMenuItem(editingItem.id, payload)
            } else {
                await createMenuItem(payload)
            }

            setShowModal(false)
            setEditingItem(null)
            await fetchItems(page) // reload trang hiện tại
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.message || 'Lưu món thất bại')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa món này?')) return
        try {
            setDeletingId(id)
            await deleteMenuItem(id)
            await fetchItems(page)
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.message || 'Xóa món thất bại')
        } finally {
            setDeletingId(null)
        }
    }

    // filter search trên TRANG HIỆN TẠI
    const filtered = items.filter((it) =>
        it.name?.toLowerCase().includes(search.toLowerCase())
    )

    const handlePageChange = async (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return
        await fetchItems(newPage)
    }

    return (
        <div>
            <h1 style={{ marginBottom: 16, color: '#f9fafb' }}>Quản lý menu (món ăn)</h1>

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
                }}
            >
                <input
                    type="text"
                    placeholder="Tìm theo tên món..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: 1,
                        minWidth: 200,
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
                        background: '#22c55e',
                        color: '#020617',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    ➕ Thêm món
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
                <div
                    style={{
                        marginBottom: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        color: '#9ca3af',
                    }}
                >
                    <span>
                        Tổng:{' '}
                        <strong style={{ color: '#e5e7eb' }}>
                            {pagination.total}
                        </strong>{' '}
                        món
                    </span>
                    <span>
                        Trang{' '}
                        <strong style={{ color: '#e5e7eb' }}>{page}</strong> /{' '}
                        {pagination.totalPages}
                    </span>
                </div>

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
                                {['ID', 'Tên món', 'Giá', 'Loại', 'Category', 'Mô tả', 'Thao tác'].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: '10px 8px',
                                                borderBottom: '1px solid #1f2937',
                                                textAlign: h === 'Giá' ? 'right' : 'left',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && !loading && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        style={{
                                            padding: 16,
                                            textAlign: 'center',
                                            color: '#6b7280',
                                        }}
                                    >
                                        Không có món nào
                                    </td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={7}
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

                            {filtered.map((it, idx) => (
                                <tr
                                    key={it.id}
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
                                        #{it.id}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: '1px solid #1f2937',
                                            padding: '10px 8px',
                                            maxWidth: 220,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                        title={it.name}
                                    >
                                        {it.name}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: '1px solid #1f2937',
                                            padding: '10px 8px',
                                            textAlign: 'right',
                                            color: '#f97316',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {Number(it.price || 0).toLocaleString('vi-VN')} ₫
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: '1px solid #1f2937',
                                            padding: '10px 8px',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {it.type || '-'}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: '1px solid #1f2937',
                                            padding: '10px 8px',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {it.category || '-'}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: '1px solid #1f2937',
                                            padding: '10px 8px',
                                            maxWidth: 260,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            color: '#9ca3af',
                                        }}
                                        title={it.description}
                                    >
                                        {it.description || '-'}
                                    </td>
                                    <td
                                        style={{
                                            borderBottom: '1px solid #1f2937',
                                            padding: '10px 8px',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <button
                                            onClick={() => openEdit(it)}
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
                                            onClick={() => handleDelete(it.id)}
                                            disabled={deletingId === it.id}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: 9999,
                                                border: '1px solid #ef4444',
                                                background:
                                                    deletingId === it.id
                                                        ? 'rgba(248,113,113,0.15)'
                                                        : 'transparent',
                                                color: '#fca5a5',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                cursor: deletingId === it.id ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {deletingId === it.id ? 'Đang xóa...' : 'Xóa'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* pagination */}
                {pagination.total > 0 && (
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
                            Hiển thị{' '}
                            <strong style={{ color: '#e5e7eb' }}>
                                {pagination.total === 0
                                    ? 0
                                    : (page - 1) * PAGE_SIZE + 1}
                                -
                                {Math.min(page * PAGE_SIZE, pagination.total)}
                            </strong>{' '}
                            /{' '}
                            <strong style={{ color: '#e5e7eb' }}>
                                {pagination.total}
                            </strong>{' '}
                            món
                        </span>

                        <div
                            style={{
                                display: 'flex',
                                gap: 6,
                                alignItems: 'center',
                            }}
                        >
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    border: '1px solid #4b5563',
                                    background: page === 1 ? '#020617' : '#0f172a',
                                    color: page === 1 ? '#4b5563' : '#e5e7eb',
                                    fontSize: 12,
                                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                                }}
                            >
                                ‹ Trước
                            </button>
                            <span>
                                Trang{' '}
                                <strong style={{ color: '#e5e7eb' }}>{page}</strong> /{' '}
                                {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === pagination.totalPages}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    border: '1px solid #4b5563',
                                    background:
                                        page === pagination.totalPages
                                            ? '#020617'
                                            : '#0f172a',
                                    color:
                                        page === pagination.totalPages
                                            ? '#4b5563'
                                            : '#e5e7eb',
                                    fontSize: 12,
                                    cursor:
                                        page === pagination.totalPages
                                            ? 'not-allowed'
                                            : 'pointer',
                                }}
                            >
                                Sau ›
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal thêm/sửa món */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 900,
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: 16,
                            width: 'min(640px, 95vw)',
                            maxHeight: '90vh',
                            padding: 24,
                            overflowY: 'auto',
                            color: 'black',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2
                            style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700 }}
                        >
                            {editingItem ? 'Sửa món' : 'Thêm món mới'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 12 }}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: 4,
                                        fontWeight: 600,
                                    }}
                                >
                                    Tên món
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: 4,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Giá (₫)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #d1d5db',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: 4,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Loại
                                    </label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #d1d5db',
                                        }}
                                    >
                                        <option value="">-- Chọn --</option>
                                        {TYPE_OPTIONS.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: 4,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #d1d5db',
                                        }}
                                    >
                                        <option value="">-- Chọn --</option>
                                        {CATEGORY_OPTIONS.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: 4,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Image URL (nếu có)
                                    </label>
                                    <input
                                        name="imageUrl"
                                        value={form.imageUrl}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #d1d5db',
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: 4,
                                        fontWeight: 600,
                                    }}
                                >
                                    Mô tả
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        resize: 'vertical',
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: 8,
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        background: '#f3f4f6',
                                        fontWeight: 600,
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        padding: '8px 22px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: '#2563eb',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                        cursor: saving ? 'default' : 'pointer',
                                    }}
                                >
                                    {saving ? 'Đang lưu...' : editingItem ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MenuItemsPage
