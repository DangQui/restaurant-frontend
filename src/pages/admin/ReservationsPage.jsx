// src/pages/admin/ReservationsPage.jsx
import { useEffect, useState } from 'react'
import {
    getReservations,
    updateReservation,
    deleteReservation,
} from '@/api/reservationApi'

const STATUS_LABELS = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã huỷ',
}

const STATUS_BADGE_STYLE = {
    pending: {
        bg: 'rgba(251,191,36,0.12)',
        color: '#facc15',
    },
    confirmed: {
        bg: 'rgba(34,197,94,0.12)',
        color: '#22c55e',
    },
    cancelled: {
        bg: 'rgba(239,68,68,0.12)',
        color: '#f87171',
    },
}

const PAGE_SIZE = 10

export default function ReservationsPage() {
    const [reservations, setReservations] = useState([])
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectedReservation, setSelectedReservation] = useState(null)

    // phân trang
    const [page, setPage] = useState(1)

    const loadReservations = async () => {
        try {
            setLoading(true)
            setError('')

            const params = {}
            if (statusFilter) params.status = statusFilter

            const data = await getReservations(params)
            setReservations(Array.isArray(data) ? data : [])
            setPage(1) // mỗi lần load/filter reset về trang 1 cho dễ nhìn
        } catch (err) {
            console.error(err)
            setError(err.message || 'Không tải được danh sách đặt bàn')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadReservations()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter])

    const handleChangeStatus = async (id, newStatus) => {
        try {
            await updateReservation(id, { status: newStatus })
            await loadReservations()
        } catch (err) {
            alert('Cập nhật trạng thái thất bại: ' + (err.message || 'Unknown error'))
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xoá reservation này?')) return
        try {
            await deleteReservation(id)
            await loadReservations()
        } catch (err) {
            alert('Xoá reservation thất bại: ' + (err.message || 'Unknown error'))
        }
    }

    // ====== TÍNH TOÁN PHÂN TRANG ======
    const total = reservations.length
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const currentPage = Math.min(page, totalPages)

    const startIndex = (currentPage - 1) * PAGE_SIZE
    const endIndex = startIndex + PAGE_SIZE
    const paginatedReservations = reservations.slice(startIndex, endIndex)

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return
        setPage(newPage)
    }

    // helper render status chip
    const renderStatusChip = (status) => {
        const style = STATUS_BADGE_STYLE[status] || {
            bg: 'rgba(148,163,184,0.12)',
            color: '#e5e7eb',
        }
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    background: style.bg,
                    color: style.color,
                    textTransform: 'capitalize',
                }}
            >
                {STATUS_LABELS[status] || status}
            </span>
        )
    }

    return (
        <div
            className="admin-page reservations-page"
            style={{ padding: 24, color: '#e5e7eb' }}
        >
            <h1
                style={{
                    fontSize: 24,
                    marginBottom: 16,
                    color: '#f9fafb',
                }}
            >
                Quản lý Đặt bàn (Reservations)
            </h1>

            {/* Toolbar lọc + actions */}
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
                            Trạng thái
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
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
                            <option value="pending">Chờ xác nhận</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="cancelled">Đã huỷ</option>
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
                        onClick={loadReservations}
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
                            !loading &&
                            (e.currentTarget.style.background = '#1e293b')
                        }
                        onMouseLeave={(e) =>
                            !loading &&
                            (e.currentTarget.style.background = '#0f172a')
                        }
                    >
                        🔄 {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>
                </div>
            </div>

            {error && (
                <div
                    style={{
                        marginBottom: 12,
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #f87171',
                        background: 'rgba(248,113,113,0.08)',
                        color: '#fecaca',
                        fontSize: 13,
                    }}
                >
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* Bảng reservations */}
                <div style={{ flex: 2 }}>
                    <div
                        style={{
                            background: '#020617',
                            borderRadius: 12,
                            border: '1px solid #1f2937',
                            padding: 16,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
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
                                Danh sách đặt bàn
                            </h2>
                            <span
                                style={{
                                    fontSize: 13,
                                    color: '#9ca3af',
                                }}
                            >
                                Tổng: <strong style={{ color: '#e5e7eb' }}>{total}</strong>{' '}
                                reservation
                            </span>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    background: '#020617',
                                    color: '#e5e7eb',
                                    fontSize: 14,
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th style={thStyle}>ID</th>
                                        <th style={thStyle}>Khách</th>
                                        <th style={thStyle}>Bàn</th>
                                        <th style={thStyle}>Số người</th>
                                        <th style={thStyle}>Thời gian</th>
                                        <th style={thStyle}>Trạng thái</th>
                                        <th style={thStyle}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedReservations.length === 0 && !loading ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                style={{
                                                    padding: 16,
                                                    textAlign: 'center',
                                                    color: '#6b7280',
                                                }}
                                            >
                                                Không có đặt bàn nào
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedReservations.map((r) => (
                                            <tr
                                                key={r.id}
                                                style={{
                                                    borderTop: '1px solid #1f2937',
                                                    cursor: 'pointer',
                                                    background:
                                                        selectedReservation &&
                                                            selectedReservation.id === r.id
                                                            ? '#111827'
                                                            : 'transparent',
                                                    transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (
                                                        !selectedReservation ||
                                                        selectedReservation.id !== r.id
                                                    ) {
                                                        e.currentTarget.style.background = '#030712'
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background =
                                                        selectedReservation &&
                                                            selectedReservation.id === r.id
                                                            ? '#111827'
                                                            : 'transparent'
                                                }}
                                                onClick={() => setSelectedReservation(r)}
                                            >
                                                <td style={tdStyle}>#{r.id}</td>
                                                <td style={tdStyle}>
                                                    {r.customerName}
                                                    <br />
                                                    <small style={{ color: '#9ca3af' }}>
                                                        {r.customerPhone}
                                                    </small>
                                                </td>
                                                <td style={tdStyle}>
                                                    {r.table?.tableNumber ?? r.tableId ?? '-'}
                                                    <br />
                                                    <small style={{ color: '#9ca3af' }}>
                                                        {r.table?.capacity
                                                            ? `Sức chứa: ${r.table.capacity}`
                                                            : ''}
                                                    </small>
                                                </td>
                                                <td style={tdStyle}>{r.partySize}</td>
                                                <td style={tdStyle}>
                                                    {r.startTime
                                                        ? new Date(r.startTime).toLocaleString('vi-VN')
                                                        : '-'}
                                                    <br />
                                                    {r.endTime && (
                                                        <small style={{ color: '#9ca3af' }}>
                                                            →{' '}
                                                            {new Date(
                                                                r.endTime
                                                            ).toLocaleTimeString('vi-VN')}
                                                        </small>
                                                    )}
                                                </td>
                                                <td style={tdStyle}>{renderStatusChip(r.status)}</td>
                                                <td style={tdStyle}>
                                                    <select
                                                        value={r.status}
                                                        onChange={(e) =>
                                                            handleChangeStatus(r.id, e.target.value)
                                                        }
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: 999,
                                                            border: '1px solid #4b5563',
                                                            background: '#020617',
                                                            color: '#e5e7eb',
                                                            fontSize: 12,
                                                            outline: 'none',
                                                        }}
                                                    >
                                                        <option value="pending">pending</option>
                                                        <option value="confirmed">confirmed</option>
                                                        <option value="cancelled">cancelled</option>
                                                    </select>
                                                    <button
                                                        style={{
                                                            marginLeft: 8,
                                                            padding: '4px 10px',
                                                            borderRadius: 999,
                                                            border: '1px solid #ef4444',
                                                            background: 'transparent',
                                                            color: '#fca5a5',
                                                            fontSize: 12,
                                                            fontWeight: 500,
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDelete(r.id)
                                                        }}
                                                    >
                                                        Xoá
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination controls */}
                        {total > 0 && (
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
                                        {total === 0 ? 0 : startIndex + 1}-
                                        {Math.min(endIndex, total)}
                                    </strong>{' '}
                                    / <strong style={{ color: '#e5e7eb' }}>{total}</strong> bản
                                    ghi
                                </span>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 6,
                                        alignItems: 'center',
                                    }}
                                >
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: 999,
                                            border: '1px solid #4b5563',
                                            background:
                                                currentPage === 1 ? '#020617' : '#0f172a',
                                            color:
                                                currentPage === 1 ? '#4b5563' : '#e5e7eb',
                                            fontSize: 12,
                                            cursor:
                                                currentPage === 1 ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        ‹ Trước
                                    </button>
                                    <span>
                                        Trang{' '}
                                        <strong style={{ color: '#e5e7eb' }}>
                                            {currentPage}
                                        </strong>{' '}
                                        / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: 999,
                                            border: '1px solid #4b5563',
                                            background:
                                                currentPage === totalPages
                                                    ? '#020617'
                                                    : '#0f172a',
                                            color:
                                                currentPage === totalPages
                                                    ? '#4b5563'
                                                    : '#e5e7eb',
                                            fontSize: 12,
                                            cursor:
                                                currentPage === totalPages
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
                </div>

                {/* Panel chi tiết */}
                <div
                    style={{
                        flex: 1,
                        background: '#020617',
                        padding: 16,
                        borderRadius: 12,
                        border: '1px solid #1f2937',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    }}
                >
                    <h2
                        style={{
                            marginBottom: 8,
                            fontSize: 18,
                            fontWeight: 600,
                            color: '#f9fafb',
                        }}
                    >
                        Chi tiết Reservation
                    </h2>
                    {!selectedReservation ? (
                        <p style={{ fontSize: 14, color: '#9ca3af' }}>
                            Chọn một reservation ở bảng bên trái để xem chi tiết.
                        </p>
                    ) : (
                        <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                            <p>
                                <strong>ID:</strong> #{selectedReservation.id}
                            </p>
                            <p>
                                <strong>Khách:</strong> {selectedReservation.customerName}{' '}
                                ({selectedReservation.customerPhone})
                            </p>
                            <p>
                                <strong>Bàn:</strong>{' '}
                                {selectedReservation.table?.tableNumber ??
                                    selectedReservation.tableId ??
                                    '-'}
                            </p>
                            <p>
                                <strong>Khu vực:</strong>{' '}
                                {selectedReservation.table?.zone || '-'}
                            </p>
                            <p>
                                <strong>Số người:</strong> {selectedReservation.partySize}
                            </p>
                            <p>
                                <strong>Thời gian:</strong>{' '}
                                {selectedReservation.startTime
                                    ? new Date(
                                        selectedReservation.startTime
                                    ).toLocaleString('vi-VN')
                                    : '-'}{' '}
                                {selectedReservation.endTime && (
                                    <>
                                        <br />
                                        <span style={{ color: '#9ca3af' }}>
                                            Kết thúc:{' '}
                                            {new Date(
                                                selectedReservation.endTime
                                            ).toLocaleTimeString('vi-VN')}
                                        </span>
                                    </>
                                )}
                            </p>
                            <p>
                                <strong>Trạng thái:</strong>{' '}
                                {renderStatusChip(selectedReservation.status)}
                            </p>
                            <p>
                                <strong>Ghi chú:</strong>{' '}
                                {selectedReservation.notes || '-'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const thStyle = {
    padding: '8px',
    borderBottom: '1px solid #4b5563',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: 13,
    color: '#9ca3af',
    whiteSpace: 'nowrap',
}

const tdStyle = {
    padding: '8px',
    verticalAlign: 'top',
    fontSize: 14,
}
