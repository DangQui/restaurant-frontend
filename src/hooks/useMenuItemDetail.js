import { useEffect, useReducer } from 'react'
import { getMenuItemById } from '@/services/menuService'

const initialState = {
  data: null,
  loading: true,
  error: null,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, loading: true, error: null }
    case 'SUCCESS':
      return { ...state, loading: false, data: action.payload }
    case 'FAILURE':
      return { ...state, loading: false, error: action.payload, data: null }
    default:
      return state
  }
}

export const useMenuItemDetail = (id, refreshKey = 0) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!id) {
      dispatch({ type: 'FAILURE', payload: 'Không tìm thấy món ăn' })
      return
    }

    let isMounted = true
    dispatch({ type: 'REQUEST' })

    getMenuItemById(id)
      .then((response) => {
        if (!isMounted) return
        dispatch({ type: 'SUCCESS', payload: response })
      })
      .catch((error) => {
        if (!isMounted) return
        dispatch({ type: 'FAILURE', payload: error.message || 'Không thể tải món ăn' })
      })

    return () => {
      isMounted = false
    }
  }, [id, refreshKey])

  return state
}

