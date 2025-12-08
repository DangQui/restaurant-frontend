import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export const useLogoNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(() => {
    if (location.pathname === '/') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      return
    }

    navigate('/', { replace: false })
  }, [location.pathname, navigate])
}










