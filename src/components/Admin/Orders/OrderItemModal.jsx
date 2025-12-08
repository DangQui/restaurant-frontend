// src/components/Admin/Orders/OrderItemModal.jsx
import React from 'react'

const OrderItemModal = ({
    open,
    mode,
    itemForm,
    menuSearch,
    setMenuSearch,
    filteredMenuItems,
    menuLoading,
    onSelectMenuItem,
    onItemFormChange,
    onSubmitItem,
    onCancel,
    itemSubmitting,
}) => {
    if (!open) return null

    const canSubmit = !!itemForm.menuItemId && !itemSubmitting

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15,23,42,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                backdropFilter: 'blur(6px)',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    background:
                        'radial-gradient(circle at top, #1f2937 0, #020617 55%, #000 100%)',
                    borderRadius: 18,
                    width: 'min(600px,95vw)',
                    maxHeight: '90vh',       // 🔹 không auto scroll toàn modal
                    overflow: 'hidden',      // chỉ list món cuộn
                    boxShadow:
                        '0 28px 70px rgba(0,0,0,0.9), 0 0 0 1px rgba(148,163,184,0.3)',
                    padding: 22,
                    position: 'relative',
                    color: '#e5e7eb',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Nút đóng */}
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 12,
                        width: 28,
                        height: 28,
                        borderRadius: '999px',
                        border: '1px solid #334155',
                        background: 'rgba(15,23,42,0.95)',
                        color: '#9ca3af',
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
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
                <div style={{ marginBottom: 18, textAlign: 'center' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '4px 12px',
                            borderRadius: 999,
                            background: 'rgba(59,130,246,0.12)',
                            border: '1px solid rgba(59,130,246,0.6)',
                            marginBottom: 8,
                        }}
                    >
                        <span>🍽️</span>
                        <span
                            style={{
                                fontSize: 11,
                                letterSpacing: 0.6,
                                textTransform: 'uppercase',
                                color: '#bfdbfe',
                                fontWeight: 600,
                            }}
                        >
                            {mode === 'create' ? 'Thêm món vào order' : 'Chỉnh sửa món'}
                        </span>
                    </div>
                    <h3
                        style={{
                            margin: 0,
                            fontSize: 22,
                            fontWeight: 700,
                            color: '#f9fafb',
                        }}
                    >
                        {mode === 'create' ? 'Thêm món mới' : 'Sửa món trong order'}
                    </h3>
                    <p
                        style={{
                            margin: '4px 0 0',
                            fontSize: 13,
                            color: '#9ca3af',
                        }}
                    >
                        Chọn món từ menu và điều chỉnh số lượng, ghi chú cho phù hợp.
                    </p>
                </div>

                {/* Ô search */}
                <input
                    type="text"
                    placeholder="Tìm món ăn theo tên..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        marginBottom: 14,
                        borderRadius: 999,
                        border: '1px solid #1f2937',
                        fontSize: 14,
                        outline: 'none',
                        backgroundColor: 'rgba(15,23,42,0.95)',
                        color: '#e5e7eb',
                        boxShadow: '0 0 0 1px rgba(15,23,42,0.8)',
                        transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6'
                        e.target.style.boxShadow =
                            '0 0 0 1px rgba(59,130,246,0.7)'
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#1f2937'
                        e.target.style.boxShadow =
                            '0 0 0 1px rgba(15,23,42,0.8)'
                    }}
                />

                {/* List món (chỉ phần này scroll) */}
                <div
                    style={{
                        maxHeight: '40vh', // 🔹 chỉ khu vực này cuộn
                        overflowY: 'auto',
                        border: '1px solid #1f2937',
                        borderRadius: 14,
                        marginBottom: 18,
                        background: '#020617',
                    }}
                >
                    {menuLoading ? (
                        <div
                            style={{
                                padding: 32,
                                textAlign: 'center',
                                color: '#9ca3af',
                                fontSize: 13,
                            }}
                        >
                            Đang tải menu...
                        </div>
                    ) : filteredMenuItems.length === 0 ? (
                        <div
                            style={{
                                padding: 32,
                                textAlign: 'center',
                                color: '#9ca3af',
                                fontSize: 13,
                            }}
                        >
                            Không tìm thấy món nào phù hợp.
                        </div>
                    ) : (
                        filteredMenuItems.map((item) => {
                            const selected = itemForm.menuItemId == item.id
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => onSelectMenuItem(item)}
                                    style={{
                                        padding: '12px 14px',
                                        borderBottom: '1px solid #1f2937',
                                        cursor: 'pointer',
                                        background: selected
                                            ? 'rgba(37,99,235,0.18)'
                                            : '#020617',
                                        transition: 'background 0.15s ease',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 12,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!selected) {
                                            e.currentTarget.style.background =
                                                '#030712'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!selected) {
                                            e.currentTarget.style.background =
                                                '#020617'
                                        }
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                fontSize: 15,
                                                color: '#e5e7eb',
                                            }}
                                        >
                                            {item.name}
                                        </div>
                                        {item.category && (
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: '#9ca3af',
                                                    marginTop: 2,
                                                }}
                                            >
                                                {item.category}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: '#f97373',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {Number(item.price).toLocaleString('vi-VN')} ₫
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Info đã chọn */}
                <div
                    style={{
                        padding: 12,
                        background:
                            itemForm.menuItemId && itemForm.price
                                ? 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))'
                                : 'linear-gradient(135deg,rgba(15,23,42,1),rgba(15,23,42,0.9))',
                        borderRadius: 12,
                        marginBottom: 16,
                        border: itemForm.menuItemId
                            ? '1px solid rgba(16,185,129,0.6)'
                            : '1px solid #1f2937',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: itemForm.menuItemId ? '#bbf7d0' : '#9ca3af',
                        }}
                    >
                        Đã chọn:{' '}
                        <span style={{ fontWeight: 700 }}>
                            {itemForm.name || 'Chưa chọn món'}
                        </span>
                    </div>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: itemForm.price ? '#f97373' : '#6b7280',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {itemForm.price
                            ? `${Number(itemForm.price).toLocaleString('vi-VN')} ₫`
                            : ''}
                    </div>
                </div>

                {/* Form số lượng + ghi chú */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1.2fr',
                        gap: 14,
                        marginBottom: 20,
                    }}
                >
                    <div>
                        <label
                            style={{
                                fontWeight: 600,
                                display: 'block',
                                marginBottom: 6,
                                fontSize: 13,
                            }}
                        >
                            Số lượng
                        </label>
                        <input
                            type="number"
                            min="1"
                            name="quantity"
                            value={itemForm.quantity}
                            onChange={onItemFormChange}
                            style={{
                                width: '100%',
                                padding: '9px 10px',
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
                                e.target.style.boxShadow =
                                    '0 0 0 1px rgba(59,130,246,0.7)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#1f2937'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </div>
                    <div>
                        <label
                            style={{
                                fontWeight: 600,
                                display: 'block',
                                marginBottom: 6,
                                fontSize: 13,
                            }}
                        >
                            Ghi chú
                        </label>
                        <input
                            type="text"
                            name="note"
                            value={itemForm.note}
                            onChange={onItemFormChange}
                            placeholder="Không cay, thêm rau..."
                            style={{
                                width: '100%',
                                padding: '9px 10px',
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
                                e.target.style.boxShadow =
                                    '0 0 0 1px rgba(59,130,246,0.7)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#1f2937'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 10,
                        marginTop: 4,
                    }}
                >
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            padding: '9px 20px',
                            borderRadius: 999,
                            background: 'linear-gradient(135deg,#020617,#020617)',
                            border: '1px solid #374151',
                            fontWeight: 500,
                            fontSize: 14,
                            color: '#e5e7eb',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = '#111827'
                            e.target.style.borderColor = '#4b5563'
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background =
                                'linear-gradient(135deg,#020617,#020617)'
                            e.target.style.borderColor = '#374151'
                        }}
                    >
                        Huỷ
                    </button>
                    <button
                        type="button"
                        onClick={onSubmitItem}
                        disabled={!canSubmit}
                        style={{
                            padding: '9px 26px',
                            borderRadius: 999,
                            background: canSubmit
                                ? 'linear-gradient(135deg,#10b981,#059669)'
                                : '#6b7280',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: 14,
                            color: '#f9fafb',
                            cursor: canSubmit ? 'pointer' : 'not-allowed',
                            // boxShadow: canSubmit
                            //     ? '0 10px 24px rgba(16,185,129,0.55)'
                            //     : 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'all 0.15s ease',
                            opacity: itemSubmitting ? 0.85 : 1,
                        }}
                    // onMouseOver={(e) => {
                    //     if (!canSubmit) return
                    //     e.target.style.transform = 'translateY(-1px)'
                    //     e.target.style.boxShadow =
                    //         '0 14px 32px rgba(16,185,129,0.7)'
                    // }}
                    // onMouseOut={(e) => {
                    //     if (!canSubmit) return
                    //     e.target.style.transform = 'translateY(0)'
                    //     e.target.style.boxShadow =
                    //         '0 10px 24px rgba(16,185,129,0.55)'
                    // }}
                    >
                        {itemSubmitting ? (
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
                                Đang lưu...
                            </>
                        ) : mode === 'create' ? (
                            <>
                                <span>➕</span> Thêm vào Order
                            </>
                        ) : (
                            <>
                                <span>💾</span> Cập nhật
                            </>
                        )}
                    </button>
                </div>

                {/* keyframes spinner */}
                <style>
                    {`@keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }`}
                </style>
            </div>
        </div>
    )
}

export default OrderItemModal
