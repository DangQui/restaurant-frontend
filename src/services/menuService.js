import { apiClient } from './apiClient'

export const getMenuItems = async (params = {}) => {
  return apiClient.get('/menu-items', { params })
}

export const getMenuItemById = async (id) => {
  if (!id) {
    throw new Error('Thiếu mã món ăn')
  }
  return apiClient.get(`/menu-items/${id}`)
}

export const createRating = async ({ menuItemId, rating, comment }) => {
  if (!menuItemId) {
    throw new Error('Thiếu mã món ăn')
  }
  return apiClient.post('/ratings', {
    body: {
      menuItemId,
      rating,
      comment,
    },
  })
}


