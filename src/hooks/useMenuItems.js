import { useEffect, useMemo, useReducer } from 'react'
import { getMenuItems } from '@/services/menuService'
import { mockMenuItems } from '@/services/data/mockMenuItems'

const initialState = {
  data: [],
  pagination: null,
  loading: true,
  error: null,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, loading: true, error: null }
    case 'SUCCESS':
      return {
        ...state,
        loading: false,
        data: action.payload.data,
        pagination: action.payload.pagination,
      }
    case 'FAILURE':
      return { ...state, loading: false, error: action.payload, data: [] }
    default:
      return state
  }
}

export const useMenuItems = (params = {}) => {
  const serializedParams = useMemo(() => JSON.stringify(params), [params])
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let isMounted = true
    dispatch({ type: 'REQUEST' })

    const requestParams = JSON.parse(serializedParams)

    getMenuItems(requestParams)
      .then((response) => {
        if (!isMounted) return
        dispatch({
          type: 'SUCCESS',
          payload: {
            data: response?.data || [],
            pagination: response?.pagination || null,
          },
        })
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('Fetch menu items error:', err)
        if (mockMenuItems.length) {
          dispatch({
            type: 'SUCCESS',
            payload: {
              data: mockMenuItems,
              pagination: {
                total: mockMenuItems.length,
              },
            },
          })
          return
        }
        dispatch({ type: 'FAILURE', payload: err.message || 'Không thể tải dữ liệu menu' })
      })

    return () => {
      isMounted = false
    }
  }, [serializedParams])

  return state
}

