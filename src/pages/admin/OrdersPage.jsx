// src/pages/Admin/OrdersPage.jsx
import React, { useEffect, useState } from 'react'
import {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    addOrderItem,
    updateOrderItem,
    deleteOrderItem,
    getMenuItems,
} from '@/api/orderApi'

import CreateOrderModal from '@/components/Admin/Orders/CreateOrderModal'
import OrderDetailModal from '@/components/Admin/Orders/OrderDetailModal'
import PaymentModal from '@/components/Admin/Orders/PaymentModal'

const ORDER_STATUSES = ['pending', 'confirmed', 'serving', 'completed', 'cancelled']
const ORDER_TYPES = ['dine-in', 'delivery']

// Helper lấy tên món an toàn
const getItemName = (item) => {
    return (
        item?.name ||
        item?.menuItemName ||
        item?.menu_item_name ||
        item?.MenuItem?.name ||
        '---'
    )
}

// Helper tính tổng tiền order
const calcOrderTotal = (order) => {
    if (!order) return 0

    if (order.total !== undefined && order.total !== null) {
        return Number(order.total) || 0
    }
    if (order.totalAmount !== undefined && order.totalAmount !== null) {
        return Number(order.totalAmount) || 0
    }
    if (Array.isArray(order.items)) {
        return order.items.reduce((sum, it) => {
            const price = Number(it.price || 0)
            const qty = Number(it.quantity || 0)
            return sum + price * qty
        }, 0)
    }

    return 0
}

const OrdersPage = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [filters, setFilters] = useState({
        orderType: '',
        status: '',
    })

    // 🆕 Phân trang FE
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10, // mỗi trang 10 order
        total: 0,
        totalPages: 1,
    })

    // Create order modal
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createForm, setCreateForm] = useState({
        orderType: 'dine-in',
        tableId: '',
        reservationId: '',
        userId: '',
        deliveryAddress: '',
        deliveryNote: '',
        customerName: '',
        customerPhone: '',
    })

    // Order detail
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showDetail, setShowDetail] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)

    // Order items modal state
    const [itemForm, setItemForm] = useState({
        id: null,
        menuItemId: '',
        name: '',
        quantity: 1,
        price: '',
        note: '',
    })
    const [itemMode, setItemMode] = useState('view') // 'view' | 'create' | 'edit'
    const [itemSubmitting, setItemSubmitting] = useState(false)

    const [statusUpdating, setStatusUpdating] = useState(false)
    const [deletingOrderId, setDeletingOrderId] = useState(null)

    const [menuItems, setMenuItems] = useState([])
    const [menuLoading, setMenuLoading] = useState(false)
    const [menuSearch, setMenuSearch] = useState('')

    const filteredMenuItems = Array.isArray(menuItems)
        ? menuItems.filter((item) =>
            item.name.toLowerCase().includes(menuSearch.toLowerCase())
        )
        : []

    // Load menu khi mở panel chi tiết
    useEffect(() => {
        if (showDetail && selectedOrder) {
            const loadMenu = async () => {
                try {
                    setMenuLoading(true)
                    const dataArray = await getMenuItems()
                    setMenuItems(Array.isArray(dataArray) ? dataArray : [])
                } catch (err) {
                    console.error('Failed to load menu:', err)
                    setError('Không tải được menu')
                } finally {
                    setMenuLoading(false)
                }
            }
            loadMenu()
        }
    }, [showDetail, selectedOrder])

    const [showPaymentModal, setShowPaymentModal] = useState(false)

    // -------- Fetch orders (FE pagination) ----------
    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError(null)

            const params = {
                orderType: filters.orderType || undefined,
                status: filters.status || undefined,
            }

            const res = await getOrders(params)

            const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : [])

            setOrders(list)

            const total = list.length
            const totalPages = Math.max(1, Math.ceil(total / pagination.limit))

            setPagination((prev) => ({
                ...prev,
                page: 1,      // reset về trang 1 mỗi khi fetch lại
                total,
                totalPages,
            }))
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    // Load lần đầu
    useEffect(() => {
        fetchOrders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Khi filter đổi → fetch lại & về page 1
    useEffect(() => {
        fetchOrders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.orderType, filters.status])

    const fetchOrderDetail = async (orderId) => {
        setDetailLoading(true)
        try {
            const data = await getOrderById(orderId)
            setSelectedOrder(data)
        } catch (err) {
            console.error('Failed to reload order detail:', err)
            setError('Không thể tải chi tiết order mới nhất.')
        } finally {
            setDetailLoading(false)
        }
    }

    // -------- Handlers for filters --------
    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    // -------- Create order --------
    const openCreateModal = () => {
        setCreateForm({
            orderType: 'dine-in',
            tableId: '',
            reservationId: '',
            userId: '',
            deliveryAddress: '',
            deliveryNote: '',
            customerName: '',
            customerPhone: '',
        })
        setShowCreateModal(true)
    }

    const handleCreateOrderChange = (e) => {
        const { name, value } = e.target
        setCreateForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleCreateOrderSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            setError(null)

            const payload = {
                orderType: createForm.orderType,
                tableId: createForm.tableId ? Number(createForm.tableId) : null,
                reservationId: createForm.reservationId
                    ? Number(createForm.reservationId)
                    : null,
                userId: createForm.userId ? Number(createForm.userId) : null,
                deliveryAddress: createForm.deliveryAddress || null,
                deliveryNote: createForm.deliveryNote || null,
                customerName: createForm.customerName || null,
                customerPhone: createForm.customerPhone || null,
            }

            const newOrder = await createOrder(payload)
            setShowCreateModal(false)
            setCreateForm({
                orderType: 'dine-in',
                tableId: '',
                reservationId: '',
                userId: '',
                deliveryAddress: '',
                deliveryNote: '',
                customerName: '',
                customerPhone: '',
            })

            await fetchOrders()
            setSelectedOrder(newOrder)
            setShowDetail(true)
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to create order')
        } finally {
            setLoading(false)
        }
    }

    // -------- Detail / load one order --------
    const openOrderDetail = async (orderId) => {
        try {
            setDetailLoading(true)
            setShowDetail(true)
            const order = await getOrderById(orderId)
            setSelectedOrder(order)
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to load order detail')
        } finally {
            setDetailLoading(false)
        }
    }

    const closeDetail = () => {
        setShowDetail(false)
        setSelectedOrder(null)
        resetItemState()
    }

    const resetItemState = () => {
        setItemMode('view')
        setItemForm({
            id: null,
            menuItemId: '',
            name: '',
            quantity: 1,
            price: '',
            note: '',
        })
        setMenuSearch('')
    }

    // -------- Update status --------
    const handleChangeStatus = async (orderId, newStatus) => {
        try {
            setStatusUpdating(true)
            await updateOrder(orderId, { status: newStatus })

            await fetchOrders()
            if (selectedOrder && selectedOrder.id === orderId) {
                const fresh = await getOrderById(orderId)
                setSelectedOrder(fresh)
            }
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to update status')
        } finally {
            setStatusUpdating(false)
        }
    }

    // -------- Delete order --------
    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xoá order này?')) return
        try {
            setDeletingOrderId(orderId)
            await deleteOrder(orderId)
            await fetchOrders()
            if (selectedOrder && selectedOrder.id === orderId) {
                closeDetail()
            }
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to delete order')
        } finally {
            setDeletingOrderId(null)
        }
    }

    // -------- Order items --------
    const openCreateItemForm = () => {
        if (!selectedOrder) return
        setItemMode('create')
        setItemForm({
            id: null,
            menuItemId: '',
            name: '',
            quantity: 1,
            price: '',
            note: '',
        })
        setMenuSearch('')
    }

    const openEditItemForm = (item) => {
        setItemMode('edit')
        setItemForm({
            id: item.id,
            menuItemId: item.menuItemId || '',
            name: getItemName(item),
            quantity: item.quantity ?? 1,
            price: item.price ?? '',
            note: item.note || '',
        })
        setMenuSearch('')
    }

    const handleItemFormChange = (e) => {
        const { name, value } = e.target
        setItemForm((prev) => ({
            ...prev,
            [name]:
                name === 'quantity'
                    ? Number(value)
                    : name === 'price'
                        ? value
                        : value,
        }))
    }

    const handleSelectMenuItem = (menuItem) => {
        setItemForm((prev) => ({
            ...prev,
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
        }))
    }

    const handleSubmitItem = async (e) => {
        e.preventDefault()
        if (!selectedOrder) return
        try {
            setItemSubmitting(true)
            const payload = {
                menuItemId: itemForm.menuItemId ? Number(itemForm.menuItemId) : null,
                quantity: itemForm.quantity || 1,
                price: itemForm.price ? Number(itemForm.price) : null,
                note: itemForm.note || null,
                name: itemForm.name || undefined,
            }

            if (itemMode === 'create') {
                await addOrderItem(selectedOrder.id, payload)
            } else {
                await updateOrderItem(selectedOrder.id, itemForm.id, payload)
            }

            const fresh = await getOrderById(selectedOrder.id)
            setSelectedOrder(fresh)
            resetItemState()
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to save order item')
        } finally {
            setItemSubmitting(false)
        }
    }

    const handleDeleteItem = async (itemId) => {
        if (!selectedOrder) return
        if (!window.confirm('Xoá món khỏi order?')) return
        try {
            setItemSubmitting(true)
            await deleteOrderItem(selectedOrder.id, itemId)
            const fresh = await getOrderById(selectedOrder.id)
            setSelectedOrder(fresh)
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to delete order item')
        } finally {
            setItemSubmitting(false)
        }
    }

    const orderTotal = calcOrderTotal(selectedOrder)

    const getMenuItemName = (menuItems, item) => {
        if (!item) return '---'
        if (item.name) return item.name
        if (!Array.isArray(menuItems)) return `Món #${item.menuItemId || ''}`
        const found = menuItems.find((m) => m.id === item.menuItemId)
        if (found) return found.name
        return `Món #${item.menuItemId || ''}`
    }

    const handlePaymentSuccess = async () => {
        setShowPaymentModal(false)
        await fetchOrders()
        if (selectedOrder) {
            const fresh = await getOrderById(selectedOrder.id)
            setSelectedOrder(fresh)
        }
    }

    // 🆕 Đổi trang (FE)
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return
        setPagination((prev) => ({
            ...prev,
            page: newPage,
        }))
    }

    // 🆕 Tính danh sách order hiển thị cho page hiện tại
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    const pageOrders = orders.slice(startIndex, endIndex)

    // ===== RENDER =====
    return (
        <div className="orders-page" style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '16px' }}>Quản lý Orders</h1>

            {error && (
                <div
                    style={{
                        marginBottom: 12,
                        padding: 8,
                        border: '1px solid #f87171',
                        background: '#fee2e2',
                        color: '#b91c1c',
                    }}
                >
                    {error}
                </div>
            )}

            {/* Filters + actions (toolbar) */}
            <div
                style={{
                    marginBottom: 20,
                    padding: 16,
                    borderRadius: 12,
                    background: '#020617',
                    border: '1px solid #1f2937',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 16,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#f1f5f9',
                }}
            >
                {/* Filters */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 12,
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#9ca3af',
                                marginBottom: 4,
                            }}
                        >
                            Loại order
                        </label>

                        <select
                            name="orderType"
                            value={filters.orderType}
                            onChange={handleFilterChange}
                            style={{
                                minWidth: 160,
                                padding: '8px 10px',
                                borderRadius: 8,
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: '#f1f5f9',
                                fontSize: 14,
                                outline: 'none',
                            }}
                        >
                            <option value="">Tất cả</option>
                            {ORDER_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#9ca3af',
                                marginBottom: 4,
                            }}
                        >
                            Trạng thái
                        </label>

                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            style={{
                                minWidth: 180,
                                padding: '8px 10px',
                                borderRadius: 8,
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: '#f1f5f9',
                                fontSize: 14,
                                outline: 'none',
                            }}
                        >
                            <option value="">Tất cả</option>
                            {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                    }}
                >
                    <button
                        onClick={fetchOrders}
                        disabled={loading}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 9999,
                            border: '1px solid #334155',
                            background: '#0f172a',
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#e2e8f0',
                            cursor: loading ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: '0.15s',
                        }}
                        onMouseEnter={(e) =>
                            !loading && (e.currentTarget.style.background = '#1e293b')
                        }
                        onMouseLeave={(e) =>
                            !loading && (e.currentTarget.style.background = '#0f172a')
                        }
                    >
                        🔄 {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>

                    <button
                        onClick={openCreateModal}
                        style={{
                            padding: '8px 18px',
                            borderRadius: 9999,
                            border: 'none',
                            background: '#2563eb',
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
                            transition: '0.15s',
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = '#1d4ed8')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = '#2563eb')
                        }
                    >
                        ➕ Tạo order mới
                    </button>
                </div>
            </div>

            {/* Orders table */}
            <div style={{ marginTop: 16 }}>
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
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 12,
                            gap: 8,
                        }}
                    >
                        <h2
                            style={{
                                margin: 0,
                                fontSize: 18,
                                fontWeight: 600,
                                color: '#f9fafb',
                            }}
                        >
                            Danh sách Orders
                        </h2>
                        <span
                            style={{
                                fontSize: 13,
                                color: '#9ca3af',
                            }}
                        >
                            Trang {pagination.page}/{pagination.totalPages} — Tổng{' '}
                            <strong style={{ color: '#e5e7eb' }}>{pagination.total}</strong> order
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
                                <tr
                                    style={{
                                        background: '#020617',
                                    }}
                                >
                                    {[
                                        'ID',
                                        'Loại',
                                        'Bàn',
                                        'Khách',
                                        'SĐT',
                                        'Trạng thái',
                                        'Tổng tiền',
                                        'Thao tác',
                                    ].map((header) => (
                                        <th
                                            key={header}
                                            style={{
                                                padding: '10px 8px',
                                                borderBottom: '1px solid #1f2937',
                                                textAlign:
                                                    header === 'Tổng tiền'
                                                        ? 'right'
                                                        : 'left',
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pageOrders.length === 0 && !loading && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            style={{
                                                padding: 16,
                                                textAlign: 'center',
                                                color: '#6b7280',
                                            }}
                                        >
                                            Không có order nào
                                        </td>
                                    </tr>
                                )}

                                {pageOrders.map((o, idx) => {
                                    const rowTotal = calcOrderTotal(o)

                                    const status = o.status || 'pending'
                                    let statusBg = '#1f2937'
                                    let statusColor = '#e5e7eb'

                                    switch (status) {
                                        case 'pending':
                                            statusBg = 'rgba(251, 191, 36, 0.15)'
                                            statusColor = '#fbbf24'
                                            break
                                        case 'confirmed':
                                            statusBg = 'rgba(34, 197, 94, 0.15)'
                                            statusColor = '#22c55e'
                                            break
                                        case 'serving':
                                            statusBg = 'rgba(59, 130, 246, 0.15)'
                                            statusColor = '#3b82f6'
                                            break
                                        case 'completed':
                                            statusBg = 'rgba(16, 185, 129, 0.15)'
                                            statusColor = '#10b981'
                                            break
                                        case 'cancelled':
                                            statusBg = 'rgba(239, 68, 68, 0.15)'
                                            statusColor = '#f87171'
                                            break
                                        default:
                                            break
                                    }

                                    return (
                                        <tr
                                            key={o.id}
                                            style={{
                                                background:
                                                    idx % 2 === 0
                                                        ? '#020617'
                                                        : '#030712',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={(e) =>
                                            (e.currentTarget.style.background =
                                                '#111827')
                                            }
                                            onMouseLeave={(e) =>
                                            (e.currentTarget.style.background =
                                                idx % 2 === 0
                                                    ? '#020617'
                                                    : '#030712')
                                            }
                                        >
                                            <td
                                                style={{
                                                    borderBottom: '1px solid #1f2937',
                                                    padding: '10px 8px',
                                                    whiteSpace: 'nowrap',
                                                    color: '#e5e7eb',
                                                }}
                                            >
                                                #{o.id}
                                            </td>
                                            <td
                                                style={{
                                                    borderBottom: '1px solid #1f2937',
                                                    padding: '10px 8px',
                                                    textTransform: 'capitalize',
                                                    color: '#e5e7eb',
                                                }}
                                            >
                                                {o.orderType}
                                            </td>
                                            <td
                                                style={{
                                                    borderBottom: '1px solid #1f2937',
                                                    padding: '10px 8px',
                                                    color: '#e5e7eb',
                                                }}
                                            >
                                                {o.tableId ?? '-'}
                                            </td>
                                            <td
                                                style={{
                                                    borderBottom: '1px solid #1f2937',
                                                    padding: '10px 8px',
                                                    maxWidth: 180,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    color: '#e5e7eb',
                                                }}
                                                title={o.customerName ?? '-'}
                                            >
                                                {o.customerName ?? '-'}
                                            </td>
                                            <td
                                                style={{
                                                    borderBottom: '1px solid #1f2937',
                                                    padding: '10px 8px',
                                                    whiteSpace: 'nowrap',
                                                    color: '#cbd5f5',
                                                    fontVariantNumeric: 'tabular-nums',
                                                }}
                                            >
                                                {o.customerPhone ?? '-'}
                                            </td>
                                            <td
                                                style={{
                                                    borderBottom: '1px solid #1f2937',
                                                    padding: '10px 8px',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '3px 10px',
                                                        borderRadius: 9999,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        background: statusBg,
                                                        color: statusColor,
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    {status}
                                                </span>
                                            </td>
                                            <td
                                                style={{
                                                    borderBottom: '1px solid #1f2937',
                                                    padding: '10px 8px',
                                                    textAlign: 'right',
                                                    whiteSpace: 'nowrap',
                                                    fontVariantNumeric: 'tabular-nums',
                                                    color: '#f97316',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {Number(rowTotal).toLocaleString(
                                                    'vi-VN'
                                                )}{' '}
                                                ₫
                                            </td>
                                            <td
                                                style={{
                                                    borderBottom: '1px solid #1f2937',
                                                    padding: '10px 8px',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        openOrderDetail(o.id)
                                                    }
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
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background =
                                                            'rgba(37,99,235,0.15)'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background =
                                                            'transparent'
                                                    }}
                                                >
                                                    Chi tiết
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteOrder(o.id)
                                                    }
                                                    disabled={
                                                        deletingOrderId === o.id
                                                    }
                                                    style={{
                                                        padding: '6px 10px',
                                                        borderRadius: 9999,
                                                        border: '1px solid #ef4444',
                                                        background:
                                                            deletingOrderId ===
                                                                o.id
                                                                ? 'rgba(248,113,113,0.15)'
                                                                : 'transparent',
                                                        color: '#fca5a5',
                                                        fontSize: 13,
                                                        fontWeight: 500,
                                                        cursor:
                                                            deletingOrderId ===
                                                                o.id
                                                                ? 'not-allowed'
                                                                : 'pointer',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (
                                                            deletingOrderId !==
                                                            o.id
                                                        ) {
                                                            e.currentTarget.style.background =
                                                                'rgba(239,68,68,0.15)'
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (
                                                            deletingOrderId !==
                                                            o.id
                                                        ) {
                                                            e.currentTarget.style.background =
                                                                'transparent'
                                                        }
                                                    }}
                                                >
                                                    {deletingOrderId === o.id
                                                        ? 'Đang xoá...'
                                                        : 'Xoá'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
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
                            Trang {pagination.page}/{pagination.totalPages} — Hiển thị tối đa{' '}
                            {pagination.limit} order / trang
                        </span>

                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: 9999,
                                    border: '1px solid #4b5563',
                                    background:
                                        pagination.page <= 1 ? '#111827' : '#020617',
                                    color: '#e5e7eb',
                                    cursor:
                                        pagination.page <= 1 ? 'not-allowed' : 'pointer',
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
                                        pagination.page >= pagination.totalPages
                                            ? '#111827'
                                            : '#020617',
                                    color: '#e5e7eb',
                                    cursor:
                                        pagination.page >= pagination.totalPages
                                            ? 'not-allowed'
                                            : 'pointer',
                                }}
                            >
                                Sau ▶
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal tạo order */}
            <CreateOrderModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                form={createForm}
                onChange={handleCreateOrderChange}
                onSubmit={handleCreateOrderSubmit}
                loading={loading}
                orderTypes={ORDER_TYPES}
            />

            {/* Modal chi tiết + modal món con bên trong */}
            <OrderDetailModal
                open={showDetail}
                order={selectedOrder}
                onClose={closeDetail}
                detailLoading={detailLoading}
                orderTotal={orderTotal}
                statuses={ORDER_STATUSES}
                statusUpdating={statusUpdating}
                onChangeStatus={handleChangeStatus}
                onOpenCreateItem={openCreateItemForm}
                onOpenEditItem={openEditItemForm}
                onDeleteItem={handleDeleteItem}
                menuItems={menuItems}
                getMenuItemName={getMenuItemName}
                // item modal props
                itemMode={itemMode}
                itemForm={itemForm}
                menuSearch={menuSearch}
                setMenuSearch={setMenuSearch}
                filteredMenuItems={filteredMenuItems}
                menuLoading={menuLoading}
                onItemFormChange={handleItemFormChange}
                onSelectMenuItem={handleSelectMenuItem}
                onSubmitItem={handleSubmitItem}
                onCancelItem={resetItemState}
                itemSubmitting={itemSubmitting}
                onOpenPayment={() => setShowPaymentModal(true)}
            />

            {/* Modal thanh toán */}
            <PaymentModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                order={selectedOrder}
                onSuccess={handlePaymentSuccess}
            />
        </div >
    )
}

export default OrdersPage
