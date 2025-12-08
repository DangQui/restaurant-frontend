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

const ORDER_STATUSES = ['pending', 'confirmed', 'serving', 'completed', 'cancelled']
const ORDER_TYPES = ['dine-in', 'delivery']

// Helper lấy tên món an toàn (tùy backend trả về field gì)
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

    // Ưu tiên dùng total nếu có (dù là number hay string)
    if (order.total !== undefined && order.total !== null) {
        return Number(order.total) || 0
    }

    // Sau đó đến totalAmount
    if (order.totalAmount !== undefined && order.totalAmount !== null) {
        return Number(order.totalAmount) || 0
    }

    // Cuối cùng, nếu có items thì tự cộng
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

    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showDetail, setShowDetail] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)

    const [itemForm, setItemForm] = useState({
        id: null,
        menuItemId: '',
        name: '',
        quantity: 1,
        price: '',
        note: '',
    })

    const [itemMode, setItemMode] = useState('view')
    const [itemSubmitting, setItemSubmitting] = useState(false)

    const [statusUpdating, setStatusUpdating] = useState(false)
    const [deletingOrderId, setDeletingOrderId] = useState(null)

    const [menuItems, setMenuItems] = useState([])
    const [menuLoading, setMenuLoading] = useState(false)
    const [menuSearch, setMenuSearch] = useState('')

    // Lọc menu theo tìm kiếm
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
                    const dataArray = await getMenuItems()   // giờ đã là array
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

    // -------- Fetch orders ----------
    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getOrders({
                orderType: filters.orderType || undefined,
                status: filters.status || undefined,
            })
            setOrders(data || [])
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.orderType, filters.status])

    const fetchOrderDetail = async (orderId) => {
        setDetailLoading(true)
        try {
            const data = await getOrderById(orderId)
            setSelectedOrder(data) // Cập nhật order mới nhất
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

        // Nếu item có sẵn name (trường hợp BE sau này trả thêm) thì ưu tiên
        if (item.name) return item.name

        if (!Array.isArray(menuItems)) return `Món #${item.menuItemId || ''}`

        const found = menuItems.find((m) => m.id === item.menuItemId)
        if (found) return found.name   // ví dụ: "Cơm gà chiên"

        return `Món #${item.menuItemId || ''}`
    }

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

            {/* Filters + actions */}
            {/* Filters + actions (toolbar đẹp hơn) */}
            <div
                style={{
                    marginBottom: 20,
                    padding: 16,
                    borderRadius: 12,
                    background: '#020617',         // Nền tối
                    border: '1px solid #1f2937',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 16,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#f1f5f9',
                }}
            >
                {/* Nhóm filter bên trái */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 12,
                        alignItems: 'center',
                    }}
                >
                    {/* Loại order */}
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#9ca3af',      // xám nhạt
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
                                backgroundColor: '#0f172a',   // nền select tối
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

                    {/* Trạng thái */}
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

                {/* Nhóm nút bên phải */}
                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                    }}
                >
                    {/* Nút làm mới */}
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
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#1e293b')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#0f172a')}
                    >
                        🔄 {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>

                    {/* Nút tạo order */}
                    <button
                        onClick={openCreateModal}
                        style={{
                            padding: '8px 18px',
                            borderRadius: 9999,
                            border: 'none',
                            background: '#2563eb',        // xanh dương nổi bật
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
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
                    >
                        ➕ Tạo order mới
                    </button>
                </div>
            </div>



            {/* Orders table */}
            {/* Bảng orders – nền tối, card đẹp hơn */}
            <div style={{ marginTop: 16 }}>
                <div
                    style={{
                        background: '#020617',            // nền tối (gần như đen xanh)
                        borderRadius: 12,
                        border: '1px solid #1f2937',
                        padding: 16,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        color: '#e5e7eb',
                    }}
                >
                    {/* Header nhỏ phía trên bảng */}
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
                            Tổng: <strong style={{ color: '#e5e7eb' }}>{orders.length}</strong> order
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
                                    {['ID', 'Loại', 'Bàn', 'Khách', 'SĐT', 'Trạng thái', 'Tổng tiền', 'Thao tác'].map(
                                        (header) => (
                                            <th
                                                key={header}
                                                style={{
                                                    padding: '10px 8px',
                                                    borderBottom: '1px solid #1f2937',
                                                    textAlign: header === 'Tổng tiền' ? 'right' : 'left',
                                                    fontWeight: 600,
                                                    color: '#9ca3af',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {header}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 && !loading && (
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

                                {orders.map((o, idx) => {
                                    const rowTotal = calcOrderTotal(o)

                                    // style cho pill trạng thái
                                    const status = o.status || 'pending'
                                    let statusBg = '#1f2937'
                                    let statusColor = '#e5e7eb'

                                    switch (status) {
                                        case 'pending':
                                            statusBg = 'rgba(251, 191, 36, 0.15)' // vàng nhạt
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
                                                background: idx % 2 === 0 ? '#020617' : '#030712',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#111827')}
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background = idx % 2 === 0 ? '#020617' : '#030712')
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
                                                {Number(rowTotal).toLocaleString('vi-VN')} ₫
                                            </td>
                                            <td
                                                style={{
                                                    borderBottom: '1px solid #1f2937',
                                                    padding: '10px 8px',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                <button
                                                    onClick={() => openOrderDetail(o.id)}
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
                                                        e.currentTarget.style.background = 'rgba(37,99,235,0.15)'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent'
                                                    }}
                                                >
                                                    Chi tiết
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrder(o.id)}
                                                    disabled={deletingOrderId === o.id}
                                                    style={{
                                                        padding: '6px 10px',
                                                        borderRadius: 9999,
                                                        border: '1px solid #ef4444',
                                                        background: deletingOrderId === o.id ? 'rgba(248,113,113,0.15)' : 'transparent',
                                                        color: '#fca5a5',
                                                        fontSize: 13,
                                                        fontWeight: 500,
                                                        cursor: deletingOrderId === o.id ? 'not-allowed' : 'pointer',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (deletingOrderId !== o.id) {
                                                            e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (deletingOrderId !== o.id) {
                                                            e.currentTarget.style.background = 'transparent'
                                                        }
                                                    }}
                                                >
                                                    {deletingOrderId === o.id ? 'Đang xoá...' : 'Xoá'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


            {/* Modal tạo order */}
            {showCreateModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        style={{
                            background: '#ffffff',
                            padding: '32px',
                            borderRadius: '16px',
                            maxWidth: '520px',
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow:
                                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            border: '1px solid #e5e7eb',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2
                            style={{
                                margin: '0 0 24px 0',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#1f2937',
                            }}
                        >
                            Tạo Order Mới
                        </h2>

                        <form onSubmit={handleCreateOrderSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                    }}
                                >
                                    Loại order <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                    name="orderType"
                                    value={createForm.orderType}
                                    onChange={handleCreateOrderChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid "#d1d5db"',
                                        fontSize: '16px',
                                        backgroundColor: '#fff',
                                    }}
                                    required
                                >
                                    {ORDER_TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {t === 'dine-in'
                                                ? 'Tại quán (Dine-in)'
                                                : 'Giao hàng (Delivery)'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {createForm.orderType === 'dine-in' && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '600',
                                            color: '#374151',
                                        }}
                                    >
                                        Table ID <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="tableId"
                                        value={createForm.tableId}
                                        onChange={handleCreateOrderChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #d1d5db',
                                            fontSize: '16px',
                                        }}
                                        placeholder="Ví dụ: 5"
                                    />
                                </div>
                            )}

                            {createForm.orderType === 'delivery' && (
                                <>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label
                                            style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontWeight: '600',
                                                color: '#374151',
                                            }}
                                        >
                                            Địa chỉ giao hàng
                                        </label>
                                        <input
                                            type="text"
                                            name="deliveryAddress"
                                            value={createForm.deliveryAddress}
                                            onChange={handleCreateOrderChange}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #d1d5db',
                                                fontSize: '16px',
                                            }}
                                            placeholder="Số 1 Đại Cồ Việt..."
                                        />
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label
                                            style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                fontWeight: '600',
                                                color: '#374151',
                                            }}
                                        >
                                            Ghi chú giao hàng
                                        </label>
                                        <input
                                            type="text"
                                            name="deliveryNote"
                                            value={createForm.deliveryNote}
                                            onChange={handleCreateOrderChange}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #d1d5db',
                                                fontSize: '16px',
                                            }}
                                            placeholder="Gọi trước khi giao, để trước cửa..."
                                        />
                                    </div>
                                </>
                            )}

                            <div style={{ marginBottom: '20px' }}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                    }}
                                >
                                    Tên khách hàng
                                </label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={createForm.customerName}
                                    onChange={handleCreateOrderChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '16px',
                                    }}
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div style={{ marginBottom: '28px' }}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                    }}
                                >
                                    Số điện thoại
                                </label>
                                <input
                                    type="text"
                                    name="customerPhone"
                                    value={createForm.customerPhone}
                                    onChange={handleCreateOrderChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '16px',
                                    }}
                                    placeholder="0987654321"
                                />
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '12px',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        background: '#f3f4f6',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Huỷ
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '10px 28px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#3b82f6',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    }}
                                    onMouseOver={(e) =>
                                        (e.target.style.background = '#2563eb')
                                    }
                                    onMouseOut={(e) =>
                                        (e.target.style.background = '#3b82f6')
                                    }
                                >
                                    {loading ? 'Đang tạo...' : 'Tạo Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== MODAL CHI TIẾT ORDER (GIỮA MÀN HÌNH) ==================== */}
            {showDetail && selectedOrder && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 900,
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={closeDetail}
                >
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            width: 'min(960px, 95vw)',
                            maxHeight: '90vh',
                            padding: '24px',
                            boxShadow:
                                '0 20px 30px -10px rgba(0,0,0,0.3)',
                            overflowY: 'auto',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px',
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: '26px',
                                    fontWeight: 'bold',
                                    color: '#111827',
                                }}
                            >
                                Order #{selectedOrder.id}
                            </h2>
                            <button
                                onClick={closeDetail}
                                style={{
                                    padding: '8px',
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {detailLoading ? (
                            <p
                                style={{
                                    textAlign: 'center',
                                    color: '#6b7280',
                                }}
                            >
                                Đang tải chi tiết...
                            </p>
                        ) : (
                            <>
                                {/* Thông tin cơ bản */}
                                <div
                                    style={{
                                        background: '#f8fafc',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        marginBottom: '24px',
                                        border: '1px solid #e2e8f0',
                                    }}
                                >
                                    <div style={{ marginBottom: '12px' }}>
                                        <strong style={{ color: '#475569' }}>Loại: </strong>{' '}
                                        <span
                                            style={{
                                                fontWeight: '600',
                                                textTransform: 'capitalize',
                                                color: 'black',
                                            }}
                                        >
                                            {selectedOrder.orderType}
                                        </span>
                                    </div>
                                    {selectedOrder.tableId && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <strong style={{ color: '#475569' }}>Bàn:</strong>{' '}
                                            <strong style={{ color: '#1d4ed8' }}>
                                                #{selectedOrder.tableId}
                                            </strong>
                                        </div>
                                    )}
                                    {selectedOrder.customerName && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <strong style={{ color: '#475569' }}>Khách: </strong>{' '}
                                            {selectedOrder.customerName}
                                        </div>
                                    )}
                                    {selectedOrder.customerPhone && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <strong style={{ color: '#475569' }}>SĐT:</strong>{' '}
                                            <a
                                                href={`tel:${selectedOrder.customerPhone}`}
                                                style={{
                                                    color: '#0891b2',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                {selectedOrder.customerPhone}
                                            </a>
                                        </div>
                                    )}
                                    <div style={{ marginBottom: '12px' }}>
                                        <strong style={{ color: '#475569' }}>
                                            Tổng tiền:
                                        </strong>{' '}
                                        <span
                                            style={{
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                color: '#dc2626',
                                            }}
                                        >
                                            {Number(orderTotal).toLocaleString('vi-VN')}đ
                                        </span>
                                    </div>
                                </div>

                                {/* Cập nhật trạng thái */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: '10px',
                                            fontWeight: '600',
                                            color: '#374151',
                                        }}
                                    >
                                        Trạng thái hiện tại
                                    </label>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) =>
                                            handleChangeStatus(
                                                selectedOrder.id,
                                                e.target.value
                                            )
                                        }
                                        disabled={statusUpdating}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            backgroundColor: '#fff',
                                            textTransform: 'capitalize',
                                            color: 'black',
                                        }}
                                    >
                                        {ORDER_STATUSES.map((s) => (
                                            <option key={s} value={s}>
                                                {s === 'pending'
                                                    ? '⏳ Chờ xác nhận'
                                                    : s === 'confirmed'
                                                        ? '✅ Đã xác nhận'
                                                        : s === 'serving'
                                                            ? '🍽 Đang phục vụ'
                                                            : s === 'completed'
                                                                ? '✔️ Hoàn thành'
                                                                : s === 'cancelled'
                                                                    ? '❌ Đã huỷ'
                                                                    : s}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Danh sách món */}
                                <div style={{ marginBottom: '20px' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '16px',
                                        }}
                                    >
                                        <h3
                                            style={{
                                                margin: 0,
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                color: '#1f2937',
                                            }}
                                        >
                                            Món trong order
                                        </h3>
                                        <button
                                            onClick={openCreateItemForm}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            + Thêm món
                                        </button>
                                    </div>
                                    <div
                                        style={{
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <table
                                            style={{
                                                width: '100%',
                                                borderCollapse: 'collapse',
                                            }}
                                        >
                                            <thead>
                                                <tr
                                                    style={{
                                                        background: '#f3f4f6',
                                                        color: '#4b5563',
                                                        fontSize: '14px',
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                    <th style={{ padding: '12px 16px' }}>Tên món</th>
                                                    <th
                                                        style={{
                                                            padding: '12px 16px',
                                                            width: '100px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        SL
                                                    </th>
                                                    <th
                                                        style={{
                                                            padding: '12px 16px',
                                                            width: '120px',
                                                            textAlign: 'right',
                                                        }}
                                                    >
                                                        Đơn giá
                                                    </th>
                                                    <th
                                                        style={{
                                                            padding: '12px 16px',
                                                            width: '120px',
                                                            textAlign: 'right',
                                                        }}
                                                    >
                                                        Thành tiền
                                                    </th>
                                                    <th
                                                        style={{
                                                            padding: '12px 16px',
                                                            width: '80px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        Hành động
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder?.items?.length > 0 ? (
                                                    selectedOrder.items.map((item) => {
                                                        const price = Number(item.price || 0)
                                                        const qty = Number(item.quantity || 0)
                                                        const lineTotal = price * qty
                                                        return (
                                                            <tr
                                                                key={item.id}
                                                                style={{
                                                                    borderBottom:
                                                                        '1px solid #e5e7eb',
                                                                    background: 'white',
                                                                    color: 'black',
                                                                }}
                                                            >
                                                                <td
                                                                    style={{
                                                                        padding: '12px 16px',
                                                                        fontWeight: '500',
                                                                    }}
                                                                >
                                                                    {getMenuItemName(menuItems, item)}
                                                                    {item.note && (
                                                                        <span
                                                                            style={{
                                                                                display: 'block',
                                                                                fontSize: '12px',
                                                                                color: '#9ca3af',
                                                                                marginTop: '4px',
                                                                            }}
                                                                        >
                                                                            (Ghi chú: {item.note})
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding: '12px 16px',
                                                                        textAlign: 'center',
                                                                    }}
                                                                >
                                                                    {qty}
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding: '12px 16px',
                                                                        textAlign: 'right',
                                                                    }}
                                                                >
                                                                    {price.toLocaleString('vi-VN')} ₫
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding: '12px 16px',
                                                                        textAlign: 'right',
                                                                        fontWeight: 'bold',
                                                                    }}
                                                                >
                                                                    {lineTotal.toLocaleString(
                                                                        'vi-VN'
                                                                    )}{' '}
                                                                    ₫
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding: '12px 16px',
                                                                        textAlign: 'center',
                                                                    }}
                                                                >
                                                                    <button
                                                                        onClick={() =>
                                                                            openEditItemForm(item)
                                                                        }
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            color: '#2563eb',
                                                                            cursor: 'pointer',
                                                                            marginRight: '8px',
                                                                        }}
                                                                    >
                                                                        Sửa
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDeleteItem(item.id)
                                                                        }
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            color: '#dc2626',
                                                                            cursor: 'pointer',
                                                                        }}
                                                                    >
                                                                        Xóa
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan="5"
                                                            style={{
                                                                padding: '20px',
                                                                textAlign: 'center',
                                                                color: '#6b7280',
                                                            }}
                                                        >
                                                            Order này chưa có món nào.
                                                        </td>
                                                    </tr>
                                                )}
                                                <tr
                                                    style={{
                                                        background: '#f9fafb',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    <td
                                                        colSpan="3"
                                                        style={{
                                                            padding: '12px 16px',
                                                            textAlign: 'right',
                                                            fontSize: '16px',
                                                            color: 'black',
                                                        }}
                                                    >
                                                        Tổng tiền Order:
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: '12px 16px',
                                                            textAlign: 'right',
                                                            fontSize: '16px',
                                                            color: '#dc2626',
                                                        }}
                                                    >
                                                        {Number(orderTotal).toLocaleString(
                                                            'vi-VN'
                                                        )}{' '}
                                                        ₫
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Modal chọn/thêm món */}
                                {(itemMode === 'create' || itemMode === 'edit') && (
                                    <div
                                        style={{
                                            position: 'fixed',
                                            inset: 0,
                                            background: 'rgba(0,0,0,0.6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 9999,
                                            backdropFilter: 'blur(10px)',
                                        }}
                                        onClick={() => {
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
                                        }}
                                    >
                                        <div
                                            style={{
                                                background: '#fff',
                                                borderRadius: '20px',
                                                width: '600px',
                                                maxWidth: '95vw',
                                                maxHeight: '92vh',
                                                overflowY: 'auto',
                                                boxShadow:
                                                    '0 25px 70px rgba(0,0,0,0.3)',
                                                padding: '32px',
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <h3
                                                style={{
                                                    margin: '0 0 24px 0',
                                                    fontSize: '26px',
                                                    fontWeight: 'bold',
                                                    color: '#111827',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {itemMode === 'create'
                                                    ? 'Thêm món mới'
                                                    : 'Sửa món'}
                                            </h3>

                                            <input
                                                type="text"
                                                placeholder="Tìm món ăn..."
                                                value={menuSearch}
                                                onChange={(e) =>
                                                    setMenuSearch(e.target.value)
                                                }
                                                style={{
                                                    width: '100%',
                                                    padding: '14px 18px',
                                                    marginBottom: '20px',
                                                    borderRadius: '14px',
                                                    border: '2px solid #e2e8f0',
                                                    fontSize: '16px',
                                                    outline: 'none',
                                                }}
                                            />

                                            <div
                                                style={{
                                                    maxHeight: '380px',
                                                    overflowY: 'auto',
                                                    border: '2px solid #e2e8f0',
                                                    borderRadius: '14px',
                                                    marginBottom: '24px',
                                                }}
                                            >
                                                {menuLoading ? (
                                                    <div
                                                        style={{
                                                            padding: '40px',
                                                            textAlign: 'center',
                                                            color: '#94a3b8',
                                                        }}
                                                    >
                                                        Đang tải menu...
                                                    </div>
                                                ) : filteredMenuItems.length === 0 ? (
                                                    <div
                                                        style={{
                                                            padding: '40px',
                                                            textAlign: 'center',
                                                            color: '#94a3b8',
                                                        }}
                                                    >
                                                        Không tìm thấy món nào
                                                    </div>
                                                ) : (
                                                    filteredMenuItems.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            onClick={() =>
                                                                setItemForm({
                                                                    ...itemForm,
                                                                    menuItemId: item.id,
                                                                    name: item.name,
                                                                    price: item.price,
                                                                })
                                                            }
                                                            style={{
                                                                padding: '16px 20px',
                                                                borderBottom:
                                                                    '1px solid #f1f5f9',
                                                                cursor: 'pointer',
                                                                background:
                                                                    itemForm.menuItemId ==
                                                                        item.id
                                                                        ? '#dbeafe'
                                                                        : 'white',
                                                                transition: '0.2s',
                                                            }}
                                                            onMouseEnter={(e) =>
                                                                itemForm.menuItemId !=
                                                                item.id &&
                                                                (e.currentTarget.style.background =
                                                                    '#f8fafc')
                                                            }
                                                            onMouseLeave={(e) =>
                                                                itemForm.menuItemId !=
                                                                item.id &&
                                                                (e.currentTarget.style.background =
                                                                    'white')
                                                            }
                                                        >
                                                            <div
                                                                style={{
                                                                    fontWeight: 'bold',
                                                                    fontSize: '17px',
                                                                    color: '#1e40af',
                                                                }}
                                                            >
                                                                {item.name}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    color: '#dc2626',
                                                                    fontWeight: 'bold',
                                                                    marginTop: '4px',
                                                                }}
                                                            >
                                                                {Number(
                                                                    item.price
                                                                ).toLocaleString('vi-VN')}{' '}
                                                                ₫
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            <div
                                                style={{
                                                    padding: '16px',
                                                    background: '#f0fdf4',
                                                    borderRadius: '12px',
                                                    marginBottom: '20px',
                                                    fontWeight: 'bold',
                                                    color: '#166534',
                                                }}
                                            >
                                                Đã chọn:{' '}
                                                {itemForm.name || 'Chưa chọn món'}{' '}
                                                {itemForm.price &&
                                                    `→ ${Number(
                                                        itemForm.price
                                                    ).toLocaleString('vi-VN')} ₫`}
                                            </div>

                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns:
                                                        '1fr 1fr',
                                                    gap: '16px',
                                                    marginBottom: '28px',
                                                }}
                                            >
                                                <div>
                                                    <label
                                                        style={{
                                                            fontWeight: '600',
                                                            display: 'block',
                                                            marginBottom: '8px',
                                                        }}
                                                    >
                                                        Số lượng
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        name="quantity"
                                                        value={itemForm.quantity}
                                                        onChange={
                                                            handleItemFormChange
                                                        }
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px',
                                                            borderRadius: '12px',
                                                            border: '2px solid #d1d5db',
                                                            fontSize: '16px',
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        style={{
                                                            fontWeight: '600',
                                                            display: 'block',
                                                            marginBottom: '8px',
                                                        }}
                                                    >
                                                        Ghi chú
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="note"
                                                        value={itemForm.note}
                                                        onChange={
                                                            handleItemFormChange
                                                        }
                                                        placeholder="Không cay, thêm rau..."
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px',
                                                            borderRadius: '12px',
                                                            border: '2px solid #d1d5db',
                                                            fontSize: '16px',
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                    gap: '16px',
                                                }}
                                            >
                                                <button
                                                    onClick={() => {
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
                                                    }}
                                                    style={{
                                                        padding: '12px 28px',
                                                        borderRadius: '12px',
                                                        background: '#f3f4f6',
                                                        border: '2px solid #e5e7eb',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    Huỷ
                                                </button>
                                                <button
                                                    onClick={handleSubmitItem}
                                                    disabled={
                                                        !itemForm.menuItemId ||
                                                        itemSubmitting
                                                    }
                                                    style={{
                                                        padding: '12px 32px',
                                                        borderRadius: '12px',
                                                        background: itemForm.menuItemId
                                                            ? '#10b981'
                                                            : '#9ca3af',
                                                        color: 'white',
                                                        border: 'none',
                                                        fontWeight: 'bold',
                                                        cursor: itemForm.menuItemId
                                                            ? 'pointer'
                                                            : 'not-allowed',
                                                    }}
                                                >
                                                    {itemSubmitting
                                                        ? 'Đang lưu...'
                                                        : itemMode === 'create'
                                                            ? 'Thêm vào Order'
                                                            : 'Cập nhật'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrdersPage
