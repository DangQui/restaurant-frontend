import { useEffect } from 'react'

export const HOME_SCROLL_KEY = 'home-scroll-position'

export const useHomeScrollMemory = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.sessionStorage) return undefined

    const saved = window.sessionStorage.getItem(HOME_SCROLL_KEY)
    if (saved) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: Number(saved) || 0,
        })
      })
    }

    const handleScroll = () => {
      window.sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY))
    }
  }, [])
}

