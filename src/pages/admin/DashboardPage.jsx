// src/pages/Admin/DashboardPage.jsx
import React, { useEffect, useState } from 'react'
import { getOrders } from '@/api/orderApi'
import { getMenuItems } from '@/api/menuApi'
import {
    getReservations,
} from '@/api/reservationApi'

// ==== RECHARTS ====
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
} from 'recharts'

// Hàm tính tổng tiền 1 order (copy logic giống OrdersPage cho đồng nhất)
const calcOrderTotal = (order) => {
    if (!order) return 0

    if (typeof order.total === 'number') return order.total
    if (typeof order.totalAmount === 'number') return order.totalAmount

    if (Array.isArray(order.items)) {
        return order.items.reduce((sum, it) => {
            const price = Number(it.price || 0)
            const qty = Number(it.quantity || 0)
            return sum + price * qty
        }, 0)
    }

    return 0
}

// ===== Helper build data cho chart doanh thu =====
const buildRevenueData = (orders, mode = 'day') => {
    if (!Array.isArray(orders)) return []

    const map = {}

    orders.forEach((o) => {
        if (!o.createdAt) return
        const d = new Date(o.createdAt)
        if (Number.isNaN(d.getTime())) return

        let key
        if (mode === 'month') {
            // nhóm theo tháng YYYY-MM
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, '0')
            key = `${y}-${m}`
        } else {
            // nhóm theo ngày YYYY-MM-DD
            key = d.toISOString().slice(0, 10)
        }

        map[key] = (map[key] || 0) + calcOrderTotal(o)
    })

    let arr = Object.entries(map).map(([label, total]) => ({
        label,
        total,
    }))

    // sort theo label (thời gian)
    arr.sort((a, b) => a.label.localeCompare(b.label))

    if (mode === 'day') {
        // chỉ lấy 7 điểm gần nhất cho gọn
        arr = arr.slice(-7)
    } else if (mode === 'month') {
        // lấy 6 tháng gần nhất
        arr = arr.slice(-6)
    }

    return arr
}

// ===== Helper build data cho chart trạng thái đơn =====
const buildOrderStatusData = (orders) => {
    if (!Array.isArray(orders)) return []

    const map = {}

    orders.forEach((o) => {
        const status = (o.status || 'unknown').toLowerCase()
        map[status] = (map[status] || 0) + 1
    })

    const labelMap = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        serving: 'Serving',
        completed: 'Completed',
        cancelled: 'Cancelled',
        unknown: 'Khác',
    }

    return Object.entries(map).map(([status, count]) => ({
        status: labelMap[status] || status,
        rawStatus: status,
        count,
    }))
}

const DashboardPage = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [orders, setOrders] = useState([])
    const [reservations, setReservations] = useState([])
    const [menuCount, setMenuCount] = useState(0)

    const [summary, setSummary] = useState({
        totalOrders: 0,
        todayOrders: 0,
        pendingOrders: 0,
        revenueToday: 0,

        totalReservations: 0,
        upcomingReservations: 0,
        pendingReservations: 0,
    })

    // ==== STATE CHO BIỂU ĐỒ ====
    // mode: 'day' = theo ngày (7 ngày gần nhất), 'month' = theo tháng (6 tháng gần nhất)
    const [revenueMode, setRevenueMode] = useState('day')
    const [revenueData, setRevenueData] = useState([])
    const [orderStatusData, setOrderStatusData] = useState([])

    const loadDashboard = async () => {
        try {
            setLoading(true)
            setError('')

            // 1) Orders
            const ordersData = await getOrders({})
            const ordersArr = Array.isArray(ordersData)
                ? ordersData
                : Array.isArray(ordersData?.data)
                    ? ordersData.data
                    : []

            // 2) Reservations
            const reservationsData = await getReservations({})
            const resArr = Array.isArray(reservationsData)
                ? reservationsData
                : Array.isArray(reservationsData?.data)
                    ? reservationsData.data
                    : []

            // 3) Menu items
            const menuResp = await getMenuItems()
            let menuArr = []
            if (Array.isArray(menuResp)) {
                menuArr = menuResp
            } else if (Array.isArray(menuResp?.data)) {
                menuArr = menuResp.data
            }

            setOrders(ordersArr)
            setReservations(resArr)
            setMenuCount(menuArr.length)

            // ====== TÍNH TOÁN SUMMARY ======
            const today = new Date()
            const todayStr = today.toISOString().slice(0, 10) // YYYY-MM-DD

            const todayOrders = ordersArr.filter(
                (o) => o.createdAt && o.createdAt.startsWith(todayStr)
            )

            const revenueToday = todayOrders.reduce(
                (sum, o) => sum + calcOrderTotal(o),
                0
            )

            const pendingOrders = ordersArr.filter(
                (o) => (o.status || '').toLowerCase() === 'pending'
            ).length

            // Reservations
            const totalReservations = resArr.length
            const pendingReservations = resArr.filter(
                (r) => (r.status || '').toLowerCase() === 'pending'
            ).length

            const now = new Date().getTime()
            const upcomingReservations = resArr.filter((r) => {
                if (!r.startTime) return false
                const start = new Date(r.startTime).getTime()
                return start >= now
            }).length

            setSummary({
                totalOrders: ordersArr.length,
                todayOrders: todayOrders.length,
                pendingOrders,
                revenueToday,

                totalReservations,
                upcomingReservations,
                pendingReservations,
            })
        } catch (err) {
            console.error(err)
            setError(err.message || 'Không tải được dữ liệu dashboard')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboard()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Khi orders hoặc revenueMode đổi -> build lại data chart
    useEffect(() => {
        setRevenueData(buildRevenueData(orders, revenueMode))
        setOrderStatusData(buildOrderStatusData(orders))
    }, [orders, revenueMode])

    // Lấy top 5 orders mới nhất
    const latestOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5)

    // Lấy 5 reservation sắp tới
    const upcomingReservations = [...reservations]
        .filter((r) => r.startTime)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, 5)

    return (
        <div
            className="admin-dashboard-page"
            style={{
                padding: 24,
                background: '#020617',
                minHeight: '100vh',
                color: '#e5e7eb',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                    gap: 12,
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: 26,
                            fontWeight: 700,
                            color: '#f9fafb',
                        }}
                    >
                        Dashboard Admin
                    </h1>
                    <p style={{ margin: '6px 0 0', color: '#9ca3af', fontSize: 14 }}>
                        Tổng quan hoạt động đơn hàng, đặt bàn và menu trong hệ thống.
                    </p>
                </div>
                <button
                    onClick={loadDashboard}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        borderRadius: 9999,
                        border: '1px solid #334155',
                        background: '#0f172a',
                        color: '#e5e7eb',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: loading ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                >
                    🔄 {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </div>

            {error && (
                <div
                    style={{
                        marginBottom: 16,
                        padding: 12,
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

            {/* GRID CARDS SUMMARY */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                {/* Tổng đơn hàng */}
                <div
                    style={{
                        background: 'linear-gradient(135deg,#0f172a,#020617)',
                        borderRadius: 16,
                        padding: 16,
                        border: '1px solid #1f2937',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    }}
                >
                    <div
                        style={{
                            fontSize: 13,
                            color: '#9ca3af',
                            marginBottom: 6,
                        }}
                    >
                        Tổng đơn hàng
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#f9fafb' }}>
                        {summary.totalOrders}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: '#22c55e' }}>
                        Hôm nay: +{summary.todayOrders} đơn mới
                    </div>
                </div>

                {/* Doanh thu hôm nay */}
                <div
                    style={{
                        background: 'linear-gradient(135deg,#172554,#020617)',
                        borderRadius: 16,
                        padding: 16,
                        border: '1px solid #1d4ed8',
                        boxShadow: '0 16px 40px rgba(15,23,42,0.8)',
                    }}
                >
                    <div style={{ fontSize: 13, color: '#bfdbfe', marginBottom: 6 }}>
                        Doanh thu hôm nay (ước tính)
                    </div>
                    <div
                        style={{
                            fontSize: 26,
                            fontWeight: 700,
                            color: '#facc15',
                        }}
                    >
                        {summary.revenueToday.toLocaleString('vi-VN')} ₫
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: '#93c5fd' }}>
                        Dựa trên tổng tiền của các order tạo hôm nay
                    </div>
                </div>

                {/* Đặt bàn */}
                <div
                    style={{
                        background: 'linear-gradient(135deg,#052e16,#020617)',
                        borderRadius: 16,
                        padding: 16,
                        border: '1px solid #14532d',
                        boxShadow: '0 14px 32px rgba(0,0,0,0.6)',
                    }}
                >
                    <div style={{ fontSize: 13, color: '#bbf7d0', marginBottom: 6 }}>
                        Đặt bàn
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div>
                            <div
                                style={{
                                    fontSize: 26,
                                    fontWeight: 700,
                                    color: '#bbf7d0',
                                }}
                            >
                                {summary.totalReservations}
                            </div>
                            <div style={{ fontSize: 12, color: '#86efac' }}>
                                tổng số lượt đặt
                            </div>
                        </div>
                        <div style={{ fontSize: 13, color: '#4ade80' }}>
                            Sắp tới: {summary.upcomingReservations}
                            <br />
                            Pending: {summary.pendingReservations}
                        </div>
                    </div>
                </div>

                {/* Số món trong menu */}
                <div
                    style={{
                        background: 'linear-gradient(135deg,#431407,#020617)',
                        borderRadius: 16,
                        padding: 16,
                        border: '1px solid #7f1d1d',
                        boxShadow: '0 14px 32px rgba(0,0,0,0.6)',
                    }}
                >
                    <div style={{ fontSize: 13, color: '#fecaca', marginBottom: 6 }}>
                        Menu món ăn
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#fee2e2' }}>
                        {menuCount}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: '#fca5a5' }}>
                        Tổng số món hiện có trong menu
                    </div>
                </div>
            </div>

            {/* ==== KHU VỰC BIỂU ĐỒ ==== */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.4fr)',
                    gap: 20,
                    marginBottom: 24,
                }}
            >
                {/* Biểu đồ doanh thu theo thời gian */}
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
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 10,
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: '#f9fafb',
                                }}
                            >
                                Doanh thu theo thời gian
                            </h2>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 12,
                                    color: '#9ca3af',
                                }}
                            >
                                Xem xu hướng doanh thu theo ngày / theo tháng
                            </p>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                gap: 8,
                                background: '#020617',
                                padding: 4,
                                borderRadius: 999,
                                border: '1px solid #1f2937',
                            }}
                        >
                            <button
                                onClick={() => setRevenueMode('day')}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    border: 'none',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    background:
                                        revenueMode === 'day' ? '#0ea5e9' : 'transparent',
                                    color:
                                        revenueMode === 'day' ? '#0f172a' : '#9ca3af',
                                    fontWeight: 500,
                                }}
                            >
                                7 ngày gần nhất
                            </button>
                            <button
                                onClick={() => setRevenueMode('month')}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    border: 'none',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    background:
                                        revenueMode === 'month' ? '#0ea5e9' : 'transparent',
                                    color:
                                        revenueMode === 'month' ? '#0f172a' : '#9ca3af',
                                    fontWeight: 500,
                                }}
                            >
                                6 tháng gần nhất
                            </button>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: 260 }}>
                        {revenueData.length === 0 ? (
                            <div
                                style={{
                                    textAlign: 'center',
                                    color: '#6b7280',
                                    fontSize: 13,
                                    paddingTop: 40,
                                }}
                            >
                                Chưa có dữ liệu để hiển thị
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#1f2937"
                                        opacity={0.8}
                                    />
                                    <XAxis
                                        dataKey="label"
                                        stroke="#9ca3af"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(v) =>
                                            v >= 1_000_000
                                                ? `${(v / 1_000_000).toFixed(1)}tr`
                                                : v.toLocaleString('vi-VN')
                                        }
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#020617', opacity: 0.3 }}
                                        contentStyle={{
                                            background: '#020617',
                                            border: '1px solid #1f2937',
                                            borderRadius: 8,
                                            fontSize: 12,
                                        }}
                                        formatter={(value) =>
                                            `${Number(value).toLocaleString('vi-VN')} ₫`
                                        }
                                        labelStyle={{ color: '#e5e7eb' }}
                                    />
                                    {/* <Legend
                                        wrapperStyle={{
                                            fontSize: 12,
                                            color: '#9ca3af',
                                        }}
                                    /> */}
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        name="Doanh thu"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={{ r: 3, strokeWidth: 1 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Biểu đồ số đơn theo trạng thái */}
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
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 10,
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
                            Trạng thái đơn hàng
                        </h2>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>
                            Phân bố số lượng theo trạng thái
                        </span>
                    </div>

                    <div style={{ width: '100%', height: 260 }}>
                        {orderStatusData.length === 0 ? (
                            <div
                                style={{
                                    textAlign: 'center',
                                    color: '#6b7280',
                                    fontSize: 13,
                                    paddingTop: 40,
                                }}
                            >
                                Chưa có dữ liệu để hiển thị
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={orderStatusData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#1f2937"
                                        opacity={0.8}
                                    />
                                    <XAxis
                                        dataKey="status"
                                        stroke="#9ca3af"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        tick={{ fontSize: 12 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#020617', opacity: 0.3 }}
                                        contentStyle={{
                                            background: '#020617',
                                            border: '1px solid #1f2937',
                                            borderRadius: 8,
                                            fontSize: 12,
                                        }}
                                        labelStyle={{ color: '#e5e7eb' }}
                                        formatter={(value) => `${value} đơn`}
                                    />
                                    <Legend
                                        wrapperStyle={{
                                            fontSize: 12,
                                            color: '#9ca3af',
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name="Số đơn"
                                        fill="#0ea5e9"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* HAI BẢNG: ĐƠN HÀNG MỚI & ĐẶT BÀN SẮP TỚI */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.4fr)',
                    gap: 20,
                }}
            >
                {/* Đơn hàng mới nhất */}
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
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 10,
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
                            Đơn hàng mới nhất
                        </h2>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>
                            Top {latestOrders.length} đơn gần đây
                        </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: 13,
                            }}
                        >
                            <thead>
                                <tr style={{ background: '#020617' }}>
                                    {['ID', 'Loại', 'Khách', 'Bàn', 'Trạng thái', 'Tổng tiền'].map(
                                        (h) => (
                                            <th
                                                key={h}
                                                style={{
                                                    padding: '8px 6px',
                                                    borderBottom: '1px solid #1f2937',
                                                    textAlign: h === 'Tổng tiền' ? 'right' : 'left',
                                                    color: '#9ca3af',
                                                    fontWeight: 600,
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
                                {latestOrders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            style={{
                                                padding: 14,
                                                textAlign: 'center',
                                                color: '#6b7280',
                                            }}
                                        >
                                            Chưa có đơn hàng nào
                                        </td>
                                    </tr>
                                ) : (
                                    latestOrders.map((o, idx) => {
                                        const total = calcOrderTotal(o)
                                        const status = (o.status || '').toLowerCase()
                                        let statusColor = '#e5e7eb'

                                        if (status === 'pending') statusColor = '#fbbf24'
                                        else if (status === 'confirmed') statusColor = '#22c55e'
                                        else if (status === 'serving') statusColor = '#3b82f6'
                                        else if (status === 'completed') statusColor = '#10b981'
                                        else if (status === 'cancelled') statusColor = '#f87171'

                                        return (
                                            <tr
                                                key={o.id}
                                                style={{
                                                    background:
                                                        idx % 2 === 0 ? '#020617' : '#030712',
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: '8px 6px',
                                                        borderBottom: '1px solid #1f2937',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    #{o.id}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '8px 6px',
                                                        borderBottom: '1px solid #1f2937',
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    {o.orderType}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '8px 6px',
                                                        borderBottom: '1px solid #1f2937',
                                                        maxWidth: 140,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        color: '#e5e7eb',
                                                    }}
                                                    title={o.customerName || '-'}
                                                >
                                                    {o.customerName || '-'}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '8px 6px',
                                                        borderBottom: '1px solid #1f2937',
                                                    }}
                                                >
                                                    {o.tableId ?? '-'}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '8px 6px',
                                                        borderBottom: '1px solid #1f2937',
                                                        color: statusColor,
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    {status || '-'}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '8px 6px',
                                                        borderBottom: '1px solid #1f2937',
                                                        textAlign: 'right',
                                                        color: '#f97316',
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {total.toLocaleString('vi-VN')} ₫
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Đặt bàn sắp tới */}
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
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 10,
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
                            Đặt bàn sắp tới
                        </h2>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>
                            Top {upcomingReservations.length} lượt đặt
                        </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: 13,
                            }}
                        >
                            <thead>
                                <tr style={{ background: '#020617' }}>
                                    {['Khách', 'Bàn', 'Số người', 'Thời gian', 'Trạng thái'].map(
                                        (h) => (
                                            <th
                                                key={h}
                                                style={{
                                                    padding: '8px 6px',
                                                    borderBottom: '1px solid #1f2937',
                                                    textAlign:
                                                        h === 'Số người' ? 'center' : 'left',
                                                    color: '#9ca3af',
                                                    fontWeight: 600,
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
                                {upcomingReservations.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            style={{
                                                padding: 14,
                                                textAlign: 'center',
                                                color: '#6b7280',
                                            }}
                                        >
                                            Không có đặt bàn sắp tới
                                        </td>
                                    </tr>
                                ) : (
                                    upcomingReservations.map((r, idx) => {
                                        const startStr = r.startTime
                                            ? new Date(r.startTime).toLocaleString('vi-VN')
                                            : '-'
                                        const statusLabel = (r.status || '').toLowerCase()

                                        return (
                                            <tr
                                                key={r.id}
                                                style={{
                                                    background:
                                                        idx % 2 === 0 ? '#020617' : '#030712',
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: '8px 6px',
                                                        borderBottom: '1px solid #1f2937',
                                                    }}
                                                >
                                                    <div>{r.customerName}</div>
                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            color: '#9ca3af',
                                                        }}
                                                    >
                                                        {r.customerPhone}
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '8px 6px',
                                                        borderBottom: '1px solid #1f2937',
                                                    }}
                                                >
                                                    {r.table?.tableNumber ?? r.tableId ?? '-'}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '8px 6px',
                                                        borderBottom: '1px solid #1f2937',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {r.partySize}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '8px 6px',
                                                        borderBottom: '1px solid #1f2937',
                                                    }}
                                                >
                                                    {startStr}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '8px 6px',
                                                        borderBottom: '1px solid #1f2937',
                                                        textTransform: 'capitalize',
                                                        color:
                                                            statusLabel === 'pending'
                                                                ? '#fbbf24'
                                                                : statusLabel === 'confirmed'
                                                                    ? '#22c55e'
                                                                    : statusLabel === 'cancelled'
                                                                        ? '#f87171'
                                                                        : '#e5e7eb',
                                                    }}
                                                >
                                                    {statusLabel || '-'}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
