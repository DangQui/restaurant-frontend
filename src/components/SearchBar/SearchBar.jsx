import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { searchMenuItems } from '@/services/searchService'
import { formatCurrency } from '@/utils/formatCurrency'
import styles from './SearchBar.module.scss'

const SearchBar = ({ onSearch, placeholder = 'Tìm kiếm món ăn...', className, showSuggestions = true }) => {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const isClickingSuggestionRef = useRef(false)
  const navigate = useNavigate()

  // Debounce search
  const debounceTimeoutRef = useRef(null)

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const result = await searchMenuItems(searchQuery, { limit: 5 })
      setSuggestions(result.hits || [])
    } catch (err) {
      console.error('Search error:', err)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (query.trim() && showSuggestions) {
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(query)
      }, 300)
    } else {
      setSuggestions([])
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [query, performSearch, showSuggestions])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleBlur = () => {
    // Không đóng dropdown nếu đang click vào suggestion
    if (isClickingSuggestionRef.current) {
      return
    }
    // Không hiển thị error khi blur cho search input
    setIsFocused(false)
    // Delay để allow click on suggestions
    setTimeout(() => {
      if (!isClickingSuggestionRef.current) {
        setShowDropdown(false)
      }
    }, 200)
  }

  const handleFocus = () => {
    setIsFocused(true)
    setError('')
    if (query.trim() && suggestions.length > 0) {
      setShowDropdown(true)
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    if (error && value.trim()) {
      setError('')
    }
    if (value.trim() && showSuggestions) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      setError('Không được để trống')
      inputRef.current?.focus()
      return
    }

    setShowDropdown(false)
    if (onSearch) {
      onSearch(trimmedQuery)
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`)
    }
    setError('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setQuery('')
      setError('')
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    isClickingSuggestionRef.current = true
    setQuery(item.name)
    setShowDropdown(false)
    setIsFocused(false)
    navigate(`/menu/${item.id}`)
    // Reset flag sau khi navigate
    setTimeout(() => {
      isClickingSuggestionRef.current = false
    }, 100)
  }

  const shouldShowDropdown = showDropdown && isFocused && query.trim() && (isLoading || suggestions.length > 0 || (!isLoading && suggestions.length === 0))

  return (
    <div className={clsx(styles.searchBar, className)}>
      <form onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={clsx(styles.input, error && styles.inputError, isFocused && styles.inputFocused)}
          aria-label="Tìm kiếm món ăn"
          aria-invalid={!!error}
          aria-describedby={error ? 'search-error' : undefined}
            aria-expanded={shouldShowDropdown}
            aria-haspopup="listbox"
        />
        <button type="submit" className={styles.searchButton} aria-label="Tìm kiếm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>
      {error && (
        <p id="search-error" className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
    </form>

      {shouldShowDropdown && (
        <div ref={dropdownRef} className={styles.dropdown} role="listbox">
          {isLoading ? (
            <div className={styles.dropdownItem}>
              <span>Đang tìm kiếm...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className={styles.dropdownList}>
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.dropdownItem}
                  onClick={(e) => handleSuggestionClick(e, item)}
                  onMouseDown={(e) => {
                    // Prevent blur event khi click vào suggestion
                    isClickingSuggestionRef.current = true
                    e.preventDefault()
                  }}
                  role="option"
                  aria-label={`Xem chi tiết ${item.name}`}
                >
                  <div className={styles.suggestionImage}>
                    <img
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=100&q=80'
                      }
                      alt={item.name}
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.suggestionContent}>
                    <span className={styles.suggestionName}>{item.name}</span>
                    <span className={styles.suggestionPrice}>{formatCurrency(item.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className={styles.dropdownItem}>
              <span>Yêu cầu không được tìm thấy</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SearchBar

