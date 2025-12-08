// src/components/Admin/Orders/OrderDetailModal.jsx
import React from 'react'
import OrderItemModal from './OrderItemModal'

const OrderDetailModal = ({
    open,
    order,
    onClose,
    detailLoading,
    orderTotal,
    statuses,
    statusUpdating,
    onChangeStatus,
    onOpenCreateItem,
    onOpenEditItem,
    onDeleteItem,
    menuItems,
    getMenuItemName,
    // item modal props
    itemMode,
    itemForm,
    menuSearch,
    setMenuSearch,
    filteredMenuItems,
    menuLoading,
    onItemFormChange,
    onSelectMenuItem,
    onSubmitItem,
    onCancelItem,
    itemSubmitting,
    onOpenPayment,
}) => {
    if (!open || !order) return null

    const isLocked = order?.status === 'completed' || order?.status === 'cancelled'

    const renderStatusLabel = (s) => {
        switch (s) {
            case 'pending':
                return '⏳ Chờ xác nhận'
            case 'confirmed':
                return '✅ Đã xác nhận'
            case 'serving':
                return '🍽 Đang phục vụ'
            case 'completed':
                return '✔️ Hoàn thành'
            case 'cancelled':
                return '❌ Đã huỷ'
            default:
                return s
        }
    }

    const getStatusChipStyle = (s) => {
        const base = {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
        }
        switch (s) {
            case 'pending':
                return {
                    ...base,
                    background: 'rgba(234,179,8,0.12)',
                    color: '#facc15',
                    border: '1px solid rgba(202,138,4,0.5)',
                }
            case 'confirmed':
                return {
                    ...base,
                    background: 'rgba(34,197,94,0.12)',
                    color: '#4ade80',
                    border: '1px solid rgba(22,163,74,0.5)',
                }
            case 'serving':
                return {
                    ...base,
                    background: 'rgba(59,130,246,0.12)',
                    color: '#93c5fd',
                    border: '1px solid rgba(37,99,235,0.5)',
                }
            case 'completed':
                return {
                    ...base,
                    background: 'rgba(16,185,129,0.12)',
                    color: '#6ee7b7',
                    border: '1px solid rgba(5,150,105,0.5)',
                }
            case 'cancelled':
                return {
                    ...base,
                    background: 'rgba(248,113,113,0.12)',
                    color: '#fecaca',
                    border: '1px solid rgba(248,113,113,0.6)',
                }
            default:
                return {
                    ...base,
                    background: 'rgba(148,163,184,0.12)',
                    color: '#e5e7eb',
                    border: '1px solid rgba(148,163,184,0.5)',
                }
        }
    }

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15,23,42,0.85)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 900,
                    backdropFilter: 'blur(6px)',
                    fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
                onClick={onClose}
            >
                <div
                    style={{
                        background:
                            'radial-gradient(circle at top, #1f2937 0, #020617 55%, #000 100%)',
                        borderRadius: 18,
                        width: 'min(960px, 95vw)',
                        maxHeight: '90vh',
                        padding: 22,
                        boxShadow:
                            '0 28px 70px rgba(0,0,0,0.9), 0 0 0 1px rgba(148,163,184,0.3)',
                        overflowY: 'auto',
                        position: 'relative',
                        color: '#e5e7eb',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Nút đóng */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: 10,
                            right: 12,
                            padding: 0,
                            width: 30,
                            height: 30,
                            borderRadius: '999px',
                            border: '1px solid #334155',
                            background: 'rgba(15,23,42,0.95)',
                            fontSize: 18,
                            cursor: 'pointer',
                            color: '#9ca3af',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.16s ease',
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = '#ef4444'
                            e.target.style.color = '#f9fafb'
                            e.target.style.borderColor = '#b91c1c'
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = 'rgba(15,23,42,0.95)'
                            e.target.style.color = '#9ca3af'
                            e.target.style.borderColor = '#334155'
                        }}
                    >
                        ×
                    </button>

                    {/* Header */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 20,
                            gap: 14,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '4px 11px',
                                    borderRadius: 999,
                                    background: 'rgba(30,64,175,0.12)',
                                    border: '1px solid rgba(30,64,175,0.6)',
                                    marginBottom: 8,
                                }}
                            >
                                <span>🧾</span>
                                <span
                                    style={{
                                        fontSize: 11,
                                        letterSpacing: 0.6,
                                        textTransform: 'uppercase',
                                        color: '#bfdbfe',
                                        fontWeight: 600,
                                    }}
                                >
                                    Order #{order.id}
                                </span>
                            </div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: '#f9fafb',
                                }}
                            >
                                Chi tiết Order #{order.id}
                            </h2>
                            <p
                                style={{
                                    margin: '4px 0 0',
                                    fontSize: 13,
                                    color: '#9ca3af',
                                }}
                            >
                                Xem trạng thái, món ăn và thực hiện thao tác thanh toán.
                            </p>
                        </div>

                        {/* Chip trạng thái */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={getStatusChipStyle(order.status)}>
                                <span
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 999,
                                        background:
                                            order.status === 'pending'
                                                ? '#facc15'
                                                : order.status === 'confirmed'
                                                    ? '#4ade80'
                                                    : order.status === 'serving'
                                                        ? '#60a5fa'
                                                        : order.status === 'completed'
                                                            ? '#22c55e'
                                                            : order.status === 'cancelled'
                                                                ? '#f97373'
                                                                : '#e5e7eb',
                                    }}
                                />
                                <span>{renderStatusLabel(order.status)}</span>
                            </div>
                            {isLocked && (
                                <div
                                    style={{
                                        marginTop: 4,
                                        fontSize: 11,
                                        color: '#fca5a5',
                                    }}
                                >
                                    Đơn đã{' '}
                                    {order.status === 'completed'
                                        ? 'hoàn thành / thanh toán'
                                        : 'bị huỷ'}
                                    – không thể chỉnh sửa.
                                </div>
                            )}
                        </div>
                    </div>

                    {detailLoading ? (
                        <p
                            style={{
                                textAlign: 'center',
                                color: '#9ca3af',
                                padding: '16px 0',
                            }}
                        >
                            Đang tải chi tiết...
                        </p>
                    ) : (
                        <>
                            {/* Thông tin cơ bản */}
                            <div
                                style={{
                                    background:
                                        'linear-gradient(135deg,rgba(15,23,42,0.9),rgba(15,23,42,1))',
                                    padding: 16,
                                    borderRadius: 14,
                                    marginBottom: 20,
                                    border: '1px solid rgba(30,64,175,0.5)',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                                    gap: 12,
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: '#9ca3af',
                                            marginBottom: 4,
                                        }}
                                    >
                                        Loại order
                                    </div>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {order.orderType}
                                    </div>
                                </div>

                                {order.tableId && (
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: '#9ca3af',
                                                marginBottom: 4,
                                            }}
                                        >
                                            Bàn
                                        </div>
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                color: '#93c5fd',
                                            }}
                                        >
                                            #{order.tableId}
                                        </div>
                                    </div>
                                )}

                                {order.customerName && (
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: '#9ca3af',
                                                marginBottom: 4,
                                            }}
                                        >
                                            Khách
                                        </div>
                                        <div style={{ fontWeight: 500 }}>
                                            {order.customerName}
                                        </div>
                                    </div>
                                )}

                                {order.customerPhone && (
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: '#9ca3af',
                                                marginBottom: 4,
                                            }}
                                        >
                                            SĐT
                                        </div>
                                        <a
                                            href={`tel:${order.customerPhone}`}
                                            style={{
                                                color: '#22d3ee',
                                                fontWeight: 600,
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {order.customerPhone}
                                        </a>
                                    </div>
                                )}

                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: '#9ca3af',
                                            marginBottom: 4,
                                        }}
                                    >
                                        Tổng tiền
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: '#f97373',
                                        }}
                                    >
                                        {Number(orderTotal).toLocaleString('vi-VN')} ₫
                                    </div>
                                </div>
                            </div>

                            {/* Cập nhật trạng thái */}
                            <div style={{ marginBottom: 20 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 8,
                                    }}
                                >
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            color: '#e5e7eb',
                                            fontSize: 13,
                                        }}
                                    >
                                        Trạng thái hiện tại
                                    </label>
                                    {isLocked && (
                                        <span
                                            style={{
                                                fontSize: 11,
                                                color: '#fca5a5',
                                            }}
                                        >
                                            Đã khóa, không thể thay đổi.
                                        </span>
                                    )}
                                </div>

                                <div
                                    style={{
                                        position: 'relative',
                                        borderRadius: 10,
                                        border: '1px solid #1f2937',
                                        background:
                                            'linear-gradient(135deg,rgba(15,23,42,0.95),rgba(15,23,42,1))',
                                        padding: '2px 10px',
                                        opacity: isLocked ? 0.6 : 1,
                                    }}
                                >
                                    <select
                                        value={order.status}
                                        onChange={(e) =>
                                            onChangeStatus(order.id, e.target.value)
                                        }
                                        disabled={statusUpdating || isLocked}
                                        style={{
                                            width: '100%',
                                            padding: '9px 0',
                                            borderRadius: 10,
                                            border: 'none',
                                            fontSize: 14,
                                            fontWeight: 600,
                                            background: 'transparent',
                                            color: '#e5e7eb',
                                            outline: 'none',
                                            textTransform: 'capitalize',
                                            appearance: 'none',
                                            cursor:
                                                statusUpdating || isLocked
                                                    ? 'not-allowed'
                                                    : 'pointer',
                                        }}
                                    >
                                        {statuses.map((s) => (
                                            <option
                                                key={s}
                                                value={s}
                                                style={{
                                                    background: '#020617',
                                                    color: '#e5e7eb',
                                                }}
                                            >
                                                {renderStatusLabel(s)}
                                            </option>
                                        ))}
                                    </select>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            right: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: 16,
                                            color: '#6b7280',
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        ▾
                                    </span>
                                </div>
                            </div>

                            {/* Danh sách món */}
                            <div style={{ marginBottom: 20 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 12,
                                    }}
                                >
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: 18,
                                            fontWeight: 600,
                                            color: '#f9fafb',
                                        }}
                                    >
                                        Món trong order
                                    </h3>
                                    <button
                                        onClick={onOpenCreateItem}
                                        disabled={isLocked}
                                        style={{
                                            padding: '8px 16px',
                                            background: isLocked
                                                ? 'rgba(148,163,184,0.35)'
                                                : 'linear-gradient(135deg,#10b981,#059669)',
                                            color: '#f9fafb',
                                            border: 'none',
                                            borderRadius: 999,
                                            fontWeight: 600,
                                            cursor: isLocked ? 'not-allowed' : 'pointer',
                                            fontSize: 14,
                                            // boxShadow: isLocked
                                            //     ? 'none'
                                            //     : '0 10px 24px rgba(16,185,129,0.5)',
                                            opacity: isLocked ? 0.7 : 1,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            transition: 'all 0.15s ease',
                                        }}
                                    // onMouseOver={(e) => {
                                    //     if (isLocked) return
                                    //     e.target.style.transform = 'translateY(-1px)'
                                    //     e.target.style.boxShadow =
                                    //         '0 14px 32px rgba(16,185,129,0.65)'
                                    // }}
                                    // onMouseOut={(e) => {
                                    //     if (isLocked) return
                                    //     e.target.style.transform = 'translateY(0)'
                                    //     e.target.style.boxShadow =
                                    //         '0 10px 24px rgba(16,185,129,0.5)'
                                    // }}
                                    >
                                        <span>➕</span> Thêm món
                                    </button>
                                </div>

                                <div
                                    style={{
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        border: '1px solid #1f2937',
                                        background: '#020617',
                                    }}
                                >
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
                                                    background: '#030712',
                                                    color: '#9ca3af',
                                                }}
                                            >
                                                <th
                                                    style={{
                                                        padding: '10px 14px',
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                    Tên món
                                                </th>
                                                <th
                                                    style={{
                                                        padding: '10px 14px',
                                                        width: 80,
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    SL
                                                </th>
                                                <th
                                                    style={{
                                                        padding: '10px 14px',
                                                        width: 110,
                                                        textAlign: 'right',
                                                    }}
                                                >
                                                    Đơn giá
                                                </th>
                                                <th
                                                    style={{
                                                        padding: '10px 14px',
                                                        width: 120,
                                                        textAlign: 'right',
                                                    }}
                                                >
                                                    Thành tiền
                                                </th>
                                                <th
                                                    style={{
                                                        padding: '10px 14px',
                                                        width: 130,
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    Hành động
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order?.items?.length > 0 ? (
                                                order.items.map((item, idx) => {
                                                    const price = Number(item.price || 0)
                                                    const qty = Number(item.quantity || 0)
                                                    const lineTotal = price * qty
                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            style={{
                                                                borderBottom:
                                                                    '1px solid #1f2937',
                                                                background:
                                                                    idx % 2 === 0
                                                                        ? '#020617'
                                                                        : '#030712',
                                                                color: '#e5e7eb',
                                                            }}
                                                        >
                                                            <td
                                                                style={{
                                                                    padding: '10px 14px',
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                {getMenuItemName(
                                                                    menuItems,
                                                                    item
                                                                )}
                                                                {item.note && (
                                                                    <span
                                                                        style={{
                                                                            display: 'block',
                                                                            fontSize: 12,
                                                                            color: '#9ca3af',
                                                                            marginTop: 4,
                                                                        }}
                                                                    >
                                                                        (Ghi chú:{' '}
                                                                        {item.note})
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding: '10px 14px',
                                                                    textAlign: 'center',
                                                                }}
                                                            >
                                                                {qty}
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding: '10px 14px',
                                                                    textAlign: 'right',
                                                                }}
                                                            >
                                                                {price.toLocaleString(
                                                                    'vi-VN'
                                                                )}{' '}
                                                                ₫
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding: '10px 14px',
                                                                    textAlign: 'right',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {lineTotal.toLocaleString(
                                                                    'vi-VN'
                                                                )}{' '}
                                                                ₫
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding: '10px 14px',
                                                                    textAlign: 'center',
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={() =>
                                                                        !isLocked &&
                                                                        onOpenEditItem(item)
                                                                    }
                                                                    disabled={isLocked}
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: isLocked
                                                                            ? '#64748b'
                                                                            : '#60a5fa',
                                                                        cursor: isLocked
                                                                            ? 'not-allowed'
                                                                            : 'pointer',
                                                                        marginRight: 8,
                                                                        fontSize: 13,
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    Sửa
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        !isLocked &&
                                                                        onDeleteItem(item.id)
                                                                    }
                                                                    disabled={isLocked}
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: isLocked
                                                                            ? '#64748b'
                                                                            : '#f97373',
                                                                        cursor: isLocked
                                                                            ? 'not-allowed'
                                                                            : 'pointer',
                                                                        fontSize: 13,
                                                                        fontWeight: 500,
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
                                                            padding: 18,
                                                            textAlign: 'center',
                                                            color: '#9ca3af',
                                                            background: '#020617',
                                                        }}
                                                    >
                                                        Order này chưa có món nào.
                                                    </td>
                                                </tr>
                                            )}
                                            <tr
                                                style={{
                                                    background: '#020617',
                                                    borderTop: '1px solid #1f2937',
                                                }}
                                            >
                                                <td
                                                    colSpan="3"
                                                    style={{
                                                        padding: '12px 16px',
                                                        textAlign: 'right',
                                                        fontSize: 15,
                                                        color: '#e5e7eb',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Tổng tiền Order:
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 16px',
                                                        textAlign: 'right',
                                                        fontSize: 16,
                                                        color: '#f97373',
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {Number(orderTotal).toLocaleString(
                                                        'vi-VN'
                                                    )}{' '}
                                                    ₫
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    {onOpenPayment && (
                                                        <div style={{ textAlign: 'center' }}>
                                                            <button
                                                                type="button"
                                                                disabled={isLocked}
                                                                onClick={onOpenPayment}
                                                                style={{
                                                                    padding: '8px 16px',
                                                                    borderRadius: 9999,
                                                                    border: 'none',
                                                                    background: isLocked
                                                                        ? '#6b7280'
                                                                        : 'linear-gradient(135deg,#16a34a,#15803d)',
                                                                    color: '#f9fafb',
                                                                    fontSize: 14,
                                                                    fontWeight: 600,
                                                                    cursor: isLocked
                                                                        ? 'not-allowed'
                                                                        : 'pointer',
                                                                    // boxShadow: isLocked
                                                                    //     ? 'none'
                                                                    //     : '0 10px 24px rgba(22,163,74,0.55)',
                                                                    transition: 'all 0.15s ease',
                                                                }}
                                                            // onMouseOver={(e) => {
                                                            //     if (isLocked) return
                                                            //     e.target.style.transform =
                                                            //         'translateY(-1px)'
                                                            //     e.target.style.boxShadow =
                                                            //         '0 14px 32px rgba(22,163,74,0.7)'
                                                            // }}
                                                            // onMouseOut={(e) => {
                                                            //     if (isLocked) return
                                                            //     e.target.style.transform =
                                                            //         'translateY(0)'
                                                            //     e.target.style.boxShadow =
                                                            //         '0 10px 24px rgba(22,163,74,0.55)'
                                                            // }}
                                                            >
                                                                {order?.status === 'completed'
                                                                    ? 'Đã thanh toán'
                                                                    : order?.status ===
                                                                        'cancelled'
                                                                        ? 'Đã huỷ'
                                                                        : 'Thanh toán'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal món con */}
            <OrderItemModal
                open={itemMode === 'create' || itemMode === 'edit'}
                mode={itemMode}
                itemForm={itemForm}
                menuSearch={menuSearch}
                setMenuSearch={setMenuSearch}
                filteredMenuItems={filteredMenuItems}
                menuLoading={menuLoading}
                onSelectMenuItem={onSelectMenuItem}
                onItemFormChange={onItemFormChange}
                onSubmitItem={onSubmitItem}
                onCancel={onCancelItem}
                itemSubmitting={itemSubmitting}
            />
        </>
    )
}

export default OrderDetailModal
