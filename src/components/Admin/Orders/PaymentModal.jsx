// src/components/Admin/Orders/PaymentModal.jsx
import React, { useState } from 'react'
import { createPayment } from '@/api/paymentApi'

const PaymentModal = ({ open, onClose, order, onSuccess }) => {
    const [method, setMethod] = useState('cash')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!open || !order) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            setError('')

            // Gọi API payment BE bạn đã viết
            await createPayment({
                orderId: order.id,
                method, // 'cash' | 'card' | 'mobile'
                // status BE tự set = 'completed'
            })

            // Sau khi thanh toán xong
            if (onSuccess) {
                await onSuccess()
            }
        } catch (err) {
            console.error(err)
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Thanh toán thất bại'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1200,
            }}
            onClick={() => !loading && onClose()}
        >
            <div
                style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    width: 'min(420px,95vw)',
                    padding: 24,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2
                    style={{
                        margin: 0,
                        marginBottom: 12,
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#111827',
                    }}
                >
                    Thanh toán cho Order #{order.id}
                </h2>
                <p
                    style={{
                        margin: '0 0 12px',
                        fontSize: 13,
                        color: '#6b7280',
                    }}
                >
                    Tổng tiền:{' '}
                    <b style={{ color: '#dc2626', fontSize: 16 }}>
                        {Number(order.total ?? order.totalAmount ?? 0).toLocaleString(
                            'vi-VN'
                        )}{' '}
                        ₫
                    </b>
                </p>

                {error && (
                    <div
                        style={{
                            marginBottom: 10,
                            padding: 8,
                            borderRadius: 8,
                            border: '1px solid #fecaca',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            fontSize: 13,
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 14 }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                            }}
                        >
                            Phương thức thanh toán
                        </label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 10,
                                border: '1px solid #d1d5db',
                                fontSize: 14,
                            }}
                        >
                            <option value="cash">Tiền mặt</option>
                            <option value="card">Thẻ (Card)</option>
                            <option value="mobile">Ví điện tử / Mobile</option>
                        </select>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 8,
                            marginTop: 10,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => !loading && onClose()}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: '1px solid #d1d5db',
                                background: '#f3f4f6',
                                fontSize: 14,
                                fontWeight: 500,
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '8px 20px',
                                borderRadius: 8,
                                border: 'none',
                                background: '#16a34a',
                                color: '#ffffff',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: loading ? 'default' : 'pointer',
                            }}
                        >
                            {loading ? 'Đang thanh toán...' : 'Xác nhận thanh toán'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PaymentModal
