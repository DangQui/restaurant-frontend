import { axiosClient } from './axiosClient'

const BASE_URL = '/reservations/tables'

// Lấy danh sách bàn
export const getTables = () =>
    axiosClient.get(BASE_URL).then((res) => res.data)

// Cập nhật trạng thái bàn (nếu cần chỉnh tay)
export const updateTableStatus = (id, status) =>
    axiosClient
        .patch(`${BASE_URL}/${id}/status`, { status })
        .then((res) => res.data)