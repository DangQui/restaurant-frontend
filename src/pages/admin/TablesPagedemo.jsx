// src/pages/Admin/TablesPage.jsx
import React, { useEffect, useState } from 'react'
import { getTables } from '@/api/tableApi'
import { createOrder } from '@/api/orderApi'

const STATUS_LABELS = {
    available: 'Trống',
    reserved: 'Đã đặt trước',
    occupied: 'Đang sử dụng',
    disabled: 'Không sử dụng',
}

const statusColor = (status) => {
    switch (status) {
        case 'available':
            return '#22c55e' // xanh
        case 'reserved':
            return '#facc15' // vàng
        case 'occupied':
            return '#f97316' // cam / đỏ nhẹ
        case 'disabled':
            return '#6b7280' // xám
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

const TablesPage = () => {
    const [tables, setTables] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [selectedZone, setSelectedZone] = useState('') // lọc khu vực
    const [selectedStatus, setSelectedStatus] = useState('') // lọc trạng thái

    const [showOrderModal, setShowOrderModal] = useState(false)
    const [selectedTable, setSelectedTable] = useState(null)
    const [orderForm, setOrderForm] = useState({
        customerName: '',
        customerPhone: '',
        note: '',
    })
    const [creatingOrder, setCreatingOrder] = useState(false)

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

    const handleClickTable = (table) => {
        // chỉ cho tạo order khi bàn trống
        if (table.status !== 'available') return

        setSelectedTable(table)
        setOrderForm({
            customerName: '',
            customerPhone: '',
            note: '',
        })
        setShowOrderModal(true)
    }

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

            // gửi order sang order-service qua gateway
            await createOrder({
                orderType: 'dine-in',
                tableId: selectedTable.id, // dùng id của bản ghi Table
                customerName: orderForm.customerName || null,
                customerPhone: orderForm.customerPhone || null,
                deliveryNote: orderForm.note || null,
            })

            // order-service đã set bàn = occupied rồi
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

    // lọc theo zone + status nếu cần
    const zones = Array.from(new Set(tables.map((t) => t.zone).filter(Boolean)))

    const filteredTables = tables.filter((t) => {
        if (selectedZone && t.zone !== selectedZone) return false
        if (selectedStatus && t.status !== selectedStatus) return false
        return true
    })

    // thống kê nhỏ nhỏ
    const stats = {
        total: tables.length,
        available: tables.filter((t) => t.status === 'available').length,
        reserved: tables.filter((t) => t.status === 'reserved').length,
        occupied: tables.filter((t) => t.status === 'occupied').length,
        disabled: tables.filter((t) => t.status === 'disabled').length,
    }

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
                    <p style={{ margin: '6px 0 0', fontSize: 14, color: '#9ca3af' }}>
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

            {/* Thông báo lỗi */}
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
                    gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                    gap: 12,
                    marginBottom: 18,
                }}
            >
                <StatCard label="Tổng số bàn" value={stats.total} color="#e5e7eb" />
                <StatCard label="Bàn trống" value={stats.available} color="#22c55e" />
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
                    <label style={{ fontSize: 13, marginRight: 6 }}>Khu vực:</label>
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
                    <label style={{ fontSize: 13, marginRight: 6 }}>Trạng thái:</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
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
                        Click vào <b>bàn màu xanh (Trống)</b> để tạo order dine-in
                    </span>
                </div>

                {loading ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
                        Đang tải danh sách bàn...
                    </div>
                ) : filteredTables.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
                        Không có bàn nào
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))',
                            gap: 12,
                        }}
                    >
                        {filteredTables.map((t) => {
                            const isAvailable = t.status === 'available'
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => handleClickTable(t)}
                                    disabled={!isAvailable}
                                    style={{
                                        textAlign: 'left',
                                        borderRadius: 12,
                                        padding: 10,
                                        border: '1px solid #1f2937',
                                        background: statusBg(t.status),
                                        cursor: isAvailable ? 'pointer' : 'default',
                                        opacity: isAvailable ? 1 : 0.8,
                                        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
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
                                    <div style={{ fontSize: 13, color: '#9ca3af' }}>
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
                                        {STATUS_LABELS[t.status] || t.status}
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

            {/* Modal tạo order cho bàn trống */}
            {showOrderModal && selectedTable && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => !creatingOrder && setShowOrderModal(false)}
                >
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: 16,
                            width: 'min(480px,95vw)',
                            padding: 20,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2
                            style={{
                                margin: 0,
                                marginBottom: 8,
                                fontSize: 20,
                                fontWeight: 700,
                            }}
                        >
                            Tạo order cho bàn {selectedTable.tableNumber}
                        </h2>
                        <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b7280' }}>
                            Loại order: <b>Ăn tại quán (dine-in)</b> – sau khi tạo, bàn sẽ chuyển
                            sang trạng thái <b>“Đang sử dụng”</b>.
                        </p>

                        <form onSubmit={handleCreateOrder}>
                            <div style={{ marginBottom: 10 }}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: 4,
                                        fontSize: 13,
                                        fontWeight: 600,
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
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        fontSize: 14,
                                    }}
                                    placeholder="VD: Anh Nam"
                                />
                            </div>

                            <div style={{ marginBottom: 10 }}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: 4,
                                        fontSize: 13,
                                        fontWeight: 600,
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
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        fontSize: 14,
                                    }}
                                    placeholder="VD: 09xx..."
                                />
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: 4,
                                        fontSize: 13,
                                        fontWeight: 600,
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
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        fontSize: 14,
                                        resize: 'vertical',
                                    }}
                                    placeholder="VD: cần thêm 1 ghế, chuẩn bị chén bát..."
                                />
                            </div>

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
                                        padding: '8px 16px',
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        background: '#f3f4f6',
                                        fontSize: 14,
                                        fontWeight: 600,
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingOrder}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: '#16a34a',
                                        color: '#ffffff',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: creatingOrder ? 'default' : 'pointer',
                                    }}
                                >
                                    {creatingOrder ? 'Đang tạo...' : 'Tạo order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
        <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>
            {label}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
)

export default TablesPage
