// src/components/Admin/Orders/CreateOrderModal.jsx
import React from 'react'

const CreateOrderModal = ({
    open,
    onClose,
    form,
    onChange,
    onSubmit,
    loading,
    orderTypes,
}) => {
    if (!open) return null

    return (
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
            onClick={onClose}
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
                        color: '#0f1011ff',
                    }}
                >
                    Tạo Order Mới
                </h2>

                <form onSubmit={onSubmit}>
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
                            value={form.orderType}
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '16px',
                                backgroundColor: '#fff',
                            }}
                            required
                        >
                            {orderTypes.map((t) => (
                                <option key={t} value={t}>
                                    {t === 'dine-in'
                                        ? 'Tại quán (Dine-in)'
                                        : 'Giao hàng (Delivery)'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {form.orderType === 'dine-in' && (
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
                                value={form.tableId}
                                onChange={onChange}
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

                    {form.orderType === 'delivery' && (
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
                                    value={form.deliveryAddress}
                                    onChange={onChange}
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
                                    value={form.deliveryNote}
                                    onChange={onChange}
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
                            value={form.customerName}
                            onChange={onChange}
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
                            value={form.customerPhone}
                            onChange={onChange}
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
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                background: '#3c3e41ff',
                                fontWeight: '600',
                                cursor: 'pointer',
                                color: "black",
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
    )
}

export default CreateOrderModal
