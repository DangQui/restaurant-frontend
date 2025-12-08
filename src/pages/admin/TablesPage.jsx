// src/pages/Admin/TablesPage.jsx
import React, { useEffect, useState } from 'react'
import { getTables } from '@/api/tableApi'
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    addOrderItem,
    updateOrderItem,
    deleteOrderItem,
    getMenuItems,
} from '@/api/orderApi'

import OrderDetailModal from '@/components/Admin/Orders/OrderDetailModal'
import PaymentModal from '@/components/Admin/Orders/PaymentModal'

const STATUS_LABELS = {
    available: 'Trống',
    reserved: 'Đã đặt trước',
    occupied: 'Đang sử dụng',
    disabled: 'Không sử dụng',
}

const statusColor = (status) => {
    switch (status) {
        case 'available':
            return '#22c55e'
        case 'reserved':
            return '#facc15'
        case 'occupied':
            return '#f97316'
        case 'disabled':
            return '#6b7280'
        default:
            return '#9ca3af'
    }
}

const statusBg = (status) => {
    switch (status) {
        case 'available':
            return 'rgba(34,197,94,0.12)'
        case 'reserved':
            return 'rgba(250,204,21,0.12)'
        case 'occupied':
            return 'rgba(249,115,22,0.12)'
        case 'disabled':
            return 'rgba(75,85,99,0.18)'
        default:
            return 'rgba(55,65,81,0.5)'
    }
}

// giống bên OrdersPage
const ORDER_STATUSES = ['pending', 'confirmed', 'serving', 'completed', 'cancelled']

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

const getMenuItemName = (menuItems, item) => {
    if (!item) return '---'
    if (item.name) return item.name
    if (!Array.isArray(menuItems)) return `Món #${item.menuItemId || ''}`
    const found = menuItems.find((m) => m.id === item.menuItemId)
    if (found) return found.name
    return `Món #${item.menuItemId || ''}`
}

const TablesPage = () => {
    const [tables, setTables] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [selectedZone, setSelectedZone] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')

    // ----- tạo order cho bàn trống -----
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [selectedTable, setSelectedTable] = useState(null)
    const [orderForm, setOrderForm] = useState({
        customerName: '',
        customerPhone: '',
        note: '',
    })
    const [creatingOrder, setCreatingOrder] = useState(false)

    // ----- chi tiết order (dùng lại modal của OrdersPage) -----
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showDetail, setShowDetail] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [statusUpdating, setStatusUpdating] = useState(false)

    // menu + item form (giống OrdersPage)
    const [menuItems, setMenuItems] = useState([])
    const [menuLoading, setMenuLoading] = useState(false)
    const [menuSearch, setMenuSearch] = useState('')

    const [itemForm, setItemForm] = useState({
        id: null,
        menuItemId: '',
        name: '',
        quantity: 1,
        price: '',
        note: '',
    })
    const [itemMode, setItemMode] = useState('view') // view | create | edit
    const [itemSubmitting, setItemSubmitting] = useState(false)

    // 🔹 thanh toán
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    const loadTables = async () => {
        try {
            setLoading(true)
            setError('')
            const data = await getTables()
            setTables(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            setError(err.message || 'Không tải được danh sách bàn')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTables()
    }, [])

    // ========= CLICK BÀN =========
    const handleClickTable = (table) => {
        // nếu bàn trống -> tạo order mới (giữ như cũ)
        if (table.status === 'available') {
            setSelectedTable(table)
            setOrderForm({
                customerName: '',
                customerPhone: '',
                note: '',
            })
            setShowOrderModal(true)
            return
        }

        // nếu bàn đã reserved / occupied -> mở chi tiết order
        openTableOrderDetail(table)
    }

    const openTableOrderDetail = async (table) => {
        try {
            setDetailLoading(true)
            setError('')
            setSelectedTable(table)
            setShowDetail(true)

            // lấy danh sách order theo tableId
            const list = await getOrders({ tableId: table.id })

            if (!Array.isArray(list) || list.length === 0) {
                setError('Không tìm thấy order nào cho bàn này.')
                setShowDetail(false)
                setSelectedOrder(null)
                return
            }

            // ưu tiên order còn hoạt động (không completed / cancelled)
            const active =
                list.find(
                    (o) =>
                        o.status !== 'completed' &&
                        o.status !== 'cancelled'
                ) || list[list.length - 1]

            // lấy chi tiết order (có items)
            const detail = await getOrderById(active.id)
            setSelectedOrder(detail)
        } catch (err) {
            console.error(err)
            setError(err.message || 'Không tải được chi tiết order của bàn')
            setShowDetail(false)
            setSelectedOrder(null)
        } finally {
            setDetailLoading(false)
        }
    }

    const closeDetail = () => {
        setShowDetail(false)
        setSelectedOrder(null)
        resetItemState()
        setMenuSearch('')
        setShowPaymentModal(false)
    }

    // ========= TẠO ORDER CHO BÀN TRỐNG =========
    const handleOrderFormChange = (e) => {
        const { name, value } = e.target
        setOrderForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleCreateOrder = async (e) => {
        e.preventDefault()
        if (!selectedTable) return

        try {
            setCreatingOrder(true)
            setError('')

            await createOrder({
                orderType: 'dine-in',
                tableId: selectedTable.id,
                customerName: orderForm.customerName || null,
                customerPhone: orderForm.customerPhone || null,
                deliveryNote: orderForm.note || null,
            })

            setShowOrderModal(false)
            setSelectedTable(null)
            await loadTables()
            alert('Tạo order thành công cho bàn ' + selectedTable.tableNumber)
        } catch (err) {
            console.error(err)
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Tạo order thất bại'
            )
        } finally {
            setCreatingOrder(false)
        }
    }

    // ========= FILTER BÀN =========
    const zones = Array.from(
        new Set(tables.map((t) => t.zone).filter(Boolean))
    )

    const filteredTables = tables.filter((t) => {
        if (selectedZone && t.zone !== selectedZone) return false
        if (selectedStatus && t.status !== selectedStatus) return false
        return true
    })

    const stats = {
        total: tables.length,
        available: tables.filter((t) => t.status === 'available').length,
        reserved: tables.filter((t) => t.status === 'reserved').length,
        occupied: tables.filter((t) => t.status === 'occupied').length,
        disabled: tables.filter((t) => t.status === 'disabled').length,
    }

    // ========= ORDER DETAIL: MENU & ITEMS (giống OrdersPage) =========

    // Lọc menu theo search
    const filteredMenuItems = Array.isArray(menuItems)
        ? menuItems.filter((item) =>
            item.name.toLowerCase().includes(menuSearch.toLowerCase())
        )
        : []

    // Tự load menu khi đang xem chi tiết order
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

    const handleChangeStatus = async (orderId, newStatus) => {
        try {
            setStatusUpdating(true)
            await updateOrder(orderId, { status: newStatus })

            // cập nhật lại bàn (status bàn có thể đổi)
            await loadTables()

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
            name: getMenuItemName(menuItems, item),
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

    const handleSubmitItem = async () => {
        if (!selectedOrder) return
        try {
            setItemSubmitting(true)
            const payload = {
                menuItemId: itemForm.menuItemId
                    ? Number(itemForm.menuItemId)
                    : null,
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

    const handlePaymentSuccess = async () => {
        setShowPaymentModal(false)
        await loadTables()

        if (selectedOrder) {
            const fresh = await getOrderById(selectedOrder.id)
            setSelectedOrder(fresh)
        }
    }

    // ========= RENDER =========
    return (
        <div
            style={{
                padding: 24,
                background: '#020617',
                minHeight: '100vh',
                color: '#e5e7eb',
                fontFamily:
                    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                    gap: 12,
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#f9fafb',
                        }}
                    >
                        Quản lý bàn ăn
                    </h1>
                    <p
                        style={{
                            margin: '6px 0 0',
                            fontSize: 14,
                            color: '#9ca3af',
                        }}
                    >
                        Xem trạng thái bàn, đặt order nhanh cho khách ăn tại quán.
                    </p>
                </div>
                <button
                    onClick={loadTables}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        borderRadius: 9999,
                        border: '1px solid #334155',
                        background: '#0f172a',
                        color: '#e5e7eb',
                        cursor: loading ? 'default' : 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                >
                    🔄 {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </div>

            {/* error */}
            {error && (
                <div
                    style={{
                        marginBottom: 16,
                        padding: 10,
                        borderRadius: 10,
                        border: '1px solid #f97373',
                        background: 'rgba(248,113,113,0.12)',
                        color: '#fecaca',
                        fontSize: 13,
                    }}
                >
                    {error}
                </div>
            )}

            {/* Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(auto-fit,minmax(180px,1fr))',
                    gap: 12,
                    marginBottom: 18,
                }}
            >
                <StatCard
                    label="Tổng số bàn"
                    value={stats.total}
                    color="#e5e7eb"
                />
                <StatCard
                    label="Bàn trống"
                    value={stats.available}
                    color="#22c55e"
                />
                <StatCard
                    label="Đã đặt trước"
                    value={stats.reserved}
                    color="#facc15"
                />
                <StatCard
                    label="Đang sử dụng"
                    value={stats.occupied}
                    color="#f97316"
                />
                <StatCard
                    label="Không sử dụng"
                    value={stats.disabled}
                    color="#9ca3af"
                />
            </div>

            {/* Bộ lọc */}
            <div
                style={{
                    marginBottom: 16,
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid #1f2937',
                    background: '#020617',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    alignItems: 'center',
                }}
            >
                <div style={{ fontSize: 13, color: '#9ca3af' }}>Bộ lọc:</div>

                <div>
                    <label
                        style={{ fontSize: 13, marginRight: 6 }}
                    >
                        Khu vực:
                    </label>
                    <select
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value)}
                        style={{
                            padding: '6px 10px',
                            borderRadius: 9999,
                            border: '1px solid #334155',
                            background: '#020617',
                            color: '#e5e7eb',
                            fontSize: 13,
                        }}
                    >
                        <option value="">Tất cả</option>
                        {zones.map((z) => (
                            <option key={z} value={z}>
                                {z}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        style={{ fontSize: 13, marginRight: 6 }}
                    >
                        Trạng thái:
                    </label>
                    <select
                        value={selectedStatus}
                        onChange={(e) =>
                            setSelectedStatus(e.target.value)
                        }
                        style={{
                            padding: '6px 10px',
                            borderRadius: 9999,
                            border: '1px solid #334155',
                            background: '#020617',
                            color: '#e5e7eb',
                            fontSize: 13,
                        }}
                    >
                        <option value="">Tất cả</option>
                        <option value="available">Trống</option>
                        <option value="reserved">Đã đặt trước</option>
                        <option value="occupied">Đang sử dụng</option>
                        <option value="disabled">Không sử dụng</option>
                    </select>
                </div>
            </div>

            {/* Lưới bàn */}
            <div
                style={{
                    background: '#020617',
                    borderRadius: 16,
                    border: '1px solid #1f2937',
                    padding: 16,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
            >
                <div
                    style={{
                        marginBottom: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        color: '#9ca3af',
                    }}
                >
                    <span>Tổng: {filteredTables.length} bàn</span>
                    <span style={{ fontSize: 12 }}>
                        Click <b>bàn màu xanh (Trống)</b> để tạo order mới,
                        click bàn khác để xem chi tiết order.
                    </span>
                </div>

                {loading ? (
                    <div
                        style={{
                            padding: 20,
                            textAlign: 'center',
                            color: '#6b7280',
                        }}
                    >
                        Đang tải danh sách bàn...
                    </div>
                ) : filteredTables.length === 0 ? (
                    <div
                        style={{
                            padding: 20,
                            textAlign: 'center',
                            color: '#6b7280',
                        }}
                    >
                        Không có bàn nào
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit,minmax(130px,1fr))',
                            gap: 12,
                        }}
                    >
                        {filteredTables.map((t) => {
                            const isAvailable = t.status === 'available'
                            return (
                                <button
                                    key={t.id}
                                    onClick={() =>
                                        handleClickTable(t)
                                    }
                                    style={{
                                        textAlign: 'left',
                                        borderRadius: 12,
                                        padding: 10,
                                        border: '1px solid #1f2937',
                                        background: statusBg(t.status),
                                        cursor: 'pointer',
                                        opacity: isAvailable
                                            ? 1
                                            : 0.95,
                                        transition:
                                            'transform 0.1s ease, box-shadow 0.1s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform =
                                            'translateY(-2px)'
                                        e.currentTarget.style.boxShadow =
                                            '0 6px 18px rgba(0,0,0,0.45)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                            'none'
                                        e.currentTarget.style.boxShadow =
                                            'none'
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            fontSize: 16,
                                            marginBottom: 4,
                                            color: '#f9fafb',
                                        }}
                                    >
                                        Bàn {t.tableNumber}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: '#9ca3af',
                                        }}
                                    >
                                        Sức chứa: {t.capacity} người
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 6,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: statusColor(t.status),
                                        }}
                                    >
                                        {STATUS_LABELS[t.status] ||
                                            t.status}
                                    </div>
                                    {t.zone && (
                                        <div
                                            style={{
                                                marginTop: 4,
                                                fontSize: 11,
                                                color: '#9ca3af',
                                            }}
                                        >
                                            Khu vực: {t.zone}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Modal tạo order cho bàn trống (giữ nguyên như cũ) */}
            {showOrderModal && selectedTable && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15,23,42,0.85)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(6px)',
                    }}
                    onClick={() => !creatingOrder && setShowOrderModal(false)}
                >
                    <div
                        style={{
                            background:
                                'radial-gradient(circle at top, #1f2937 0, #020617 55%, #000 100%)',
                            borderRadius: 18,
                            width: 'min(480px,95vw)',
                            padding: 22,
                            color: '#e5e7eb',
                            boxShadow:
                                '0 24px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(148,163,184,0.28)',
                            border: '1px solid rgba(30,64,175,0.45)',
                            position: 'relative',
                            maxHeight: '88vh',
                            overflowY: 'auto',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* nút đóng */}
                        <button
                            type="button"
                            onClick={() => !creatingOrder && setShowOrderModal(false)}
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 12,
                                width: 28,
                                height: 28,
                                borderRadius: '999px',
                                border: '1px solid #334155',
                                background: 'rgba(15,23,42,0.9)',
                                color: '#9ca3af',
                                fontSize: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: creatingOrder ? 'default' : 'pointer',
                                transition: 'all 0.16s ease',
                            }}
                            onMouseOver={(e) => {
                                if (creatingOrder) return
                                e.target.style.background = '#ef4444'
                                e.target.style.color = '#f9fafb'
                                e.target.style.borderColor = '#b91c1c'
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'rgba(15,23,42,0.9)'
                                e.target.style.color = '#9ca3af'
                                e.target.style.borderColor = '#334155'
                            }}
                            disabled={creatingOrder}
                        >
                            ×
                        </button>

                        {/* header */}
                        <div style={{ marginBottom: 16 }}>
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    background: 'rgba(22,163,74,0.1)',
                                    border: '1px solid rgba(34,197,94,0.4)',
                                    marginBottom: 8,
                                }}
                            >
                                <span role="img" aria-label="table">
                                    🍽️
                                </span>
                                <span
                                    style={{
                                        fontSize: 11,
                                        letterSpacing: 0.6,
                                        textTransform: 'uppercase',
                                        color: '#bbf7d0',
                                        fontWeight: 600,
                                    }}
                                >
                                    Bàn {selectedTable.tableNumber}
                                </span>
                            </div>

                            <h2
                                style={{
                                    margin: 0,
                                    marginBottom: 4,
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: '#f9fafb',
                                }}
                            >
                                Tạo order cho bàn {selectedTable.tableNumber}
                            </h2>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 13,
                                    color: '#9ca3af',
                                }}
                            >
                                Loại order: <b>Ăn tại quán (dine-in)</b> – sau khi tạo, bàn sẽ chuyển sang
                                trạng thái <b>“Đang sử dụng”</b>.
                            </p>
                        </div>

                        <form onSubmit={handleCreateOrder}>
                            {/* Tên khách */}
                            <div style={{ marginBottom: 12 }}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: 6,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#e5e7eb',
                                    }}
                                >
                                    Tên khách (nếu có)
                                </label>
                                <input
                                    name="customerName"
                                    value={orderForm.customerName}
                                    onChange={handleOrderFormChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: 10,
                                        border: '1px solid #1f2937',
                                        fontSize: 14,
                                        backgroundColor: 'rgba(15,23,42,0.95)',
                                        color: '#e5e7eb',
                                        outline: 'none',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6'
                                        e.target.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.6)'
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#1f2937'
                                        e.target.style.boxShadow = 'none'
                                    }}
                                    placeholder="VD: Anh Nam"
                                />
                            </div>

                            {/* SĐT */}
                            <div style={{ marginBottom: 12 }}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: 6,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#e5e7eb',
                                    }}
                                >
                                    SĐT khách (nếu có)
                                </label>
                                <input
                                    name="customerPhone"
                                    value={orderForm.customerPhone}
                                    onChange={handleOrderFormChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: 10,
                                        border: '1px solid #1f2937',
                                        fontSize: 14,
                                        backgroundColor: 'rgba(15,23,42,0.95)',
                                        color: '#e5e7eb',
                                        outline: 'none',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6'
                                        e.target.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.6)'
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#1f2937'
                                        e.target.style.boxShadow = 'none'
                                    }}
                                    placeholder="VD: 09xx..."
                                />
                            </div>

                            {/* Ghi chú */}
                            <div style={{ marginBottom: 16 }}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: 6,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#e5e7eb',
                                    }}
                                >
                                    Ghi chú
                                </label>
                                <textarea
                                    name="note"
                                    value={orderForm.note}
                                    onChange={handleOrderFormChange}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: 10,
                                        border: '1px solid #1f2937',
                                        fontSize: 14,
                                        backgroundColor: 'rgba(15,23,42,0.95)',
                                        color: '#e5e7eb',
                                        resize: 'vertical',
                                        outline: 'none',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6'
                                        e.target.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.6)'
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#1f2937'
                                        e.target.style.boxShadow = 'none'
                                    }}
                                    placeholder="VD: cần thêm 1 ghế, chuẩn bị chén bát..."
                                />
                            </div>

                            {/* buttons */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: 8,
                                    marginTop: 8,
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => !creatingOrder && setShowOrderModal(false)}
                                    style={{
                                        padding: '8px 15px',
                                        borderRadius: 999,
                                        border: '1px solid #374151',
                                        background: 'linear-gradient(135deg,#020617,#020617)',
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: '#e5e7eb',
                                        cursor: creatingOrder ? 'default' : 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseOver={(e) => {
                                        if (creatingOrder) return
                                        e.target.style.background = '#111827'
                                        e.target.style.borderColor = '#4b5563'
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.background =
                                            'linear-gradient(135deg,#020617,#020617)'
                                        e.target.style.borderColor = '#374151'
                                    }}
                                    disabled={creatingOrder}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingOrder}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: 999,
                                        border: 'none',
                                        background: 'linear-gradient(135deg,#16a34a,#15803d)',
                                        color: '#f9fafb',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: creatingOrder ? 'default' : 'pointer',
                                        transition: 'all 0.15s ease',
                                        opacity: creatingOrder ? 0.85 : 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                // onMouseOver={(e) => {
                                //     if (creatingOrder) return
                                //     e.target.style.transform = 'translateY(-1px)'
                                //     e.target.style.boxShadow =
                                //         '0 14px 32px rgba(22,163,74,0.7)'
                                // }}
                                // onMouseOut={(e) => {
                                //     e.target.style.transform = 'translateY(0)'
                                //     e.target.style.boxShadow =
                                //         '0 10px 25px rgba(22,163,74,0.55)'
                                // }}
                                >
                                    {creatingOrder ? (
                                        <>
                                            <span
                                                style={{
                                                    width: 14,
                                                    height: 14,
                                                    borderRadius: '999px',
                                                    border: '2px solid rgba(220,252,231,0.5)',
                                                    borderTopColor: '#dcfce7',
                                                    animation: 'spin 0.7s linear infinite',
                                                }}
                                            />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        <>
                                            <span>➕</span> Tạo order
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* keyframes cho spinner */}
                            <style>
                                {`@keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
          }`}
                            </style>
                        </form>
                    </div>
                </div>
            )}


            {/* Modal chi tiết order - DÙNG LẠI bên OrdersPage */}
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
            {/* 🔹 Modal thanh toán dùng lại như OrdersPage */}
            <PaymentModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                order={selectedOrder}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    )
}

const StatCard = ({ label, value, color }) => (
    <div
        style={{
            padding: 12,
            borderRadius: 12,
            background: '#020617',
            border: '1px solid #1f2937',
        }}
    >
        <div
            style={{
                fontSize: 13,
                color: '#9ca3af',
                marginBottom: 4,
            }}
        >
            {label}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
)

export default TablesPage
