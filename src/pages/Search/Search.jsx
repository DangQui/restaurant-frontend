import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import SectionHeading from '@/components/SectionHeading/SectionHeading'
import Loading from '@/components/Loading/Loading'
import { useMenuItems } from '@/hooks/useMenuItems'
import { formatCurrency } from '@/utils/formatCurrency'
import SearchBar from '@/components/SearchBar/SearchBar'
import styles from './Search.module.scss'

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)

  const { data, loading, error } = useMenuItems({
    query: searchQuery,
    limit: 50,
  })

  useEffect(() => {
    setSearchQuery(query)
  }, [query])

  const handleSearch = (newQuery) => {
    setSearchParams({ q: newQuery })
    setSearchQuery(newQuery)
  }

  const categories = [...new Set(data.map((item) => item.category))]

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div className={styles.container}>
          <SectionHeading
            eyebrow="Tìm kiếm"
            title={query ? `Kết quả cho "${query}"` : 'Tìm kiếm món ăn'}
            description={query ? `Tìm thấy ${data.length} món ăn` : 'Nhập từ khóa để tìm món ăn bạn yêu thích'}
          />
          <div className={styles.searchWrapper}>
            <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm món ăn..." />
          </div>
        </div>
      </section>

      {loading ? (
        <section className={styles.results}>
          <div className={styles.container}>
            <Loading text="Đang tìm kiếm..." />
          </div>
        </section>
      ) : error ? (
        <section className={styles.results}>
          <div className={styles.container}>
            <p className={styles.feedback}>{error}</p>
          </div>
        </section>
      ) : query && data.length === 0 ? (
        <section className={styles.results}>
          <div className={styles.container}>
            <p className={styles.feedback}>Không tìm thấy món ăn nào với từ khóa "{query}"</p>
          </div>
        </section>
      ) : query && data.length > 0 ? (
        <section className={styles.results}>
          <div className={styles.container}>
            {categories.length > 1 && (
              <div className={styles.filters}>
                <span>Lọc theo:</span>
                <div className={styles.categoryTags}>
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleSearch(`${query} ${category}`)}
                      className={styles.categoryTag}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.grid}>
              {data.map((item) => (
                <Link key={item.id} to={`/menu/${item.id}`} className={styles.card}>
                  <div className={styles.cardMedia}>
                    <img
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={item.name}
                      loading="lazy"
                    />
                    {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
                  </div>
                  <div className={styles.cardBody}>
                    <h3>{item.name}</h3>
                    <p>{item.description || `Phục vụ vào bữa ${item.category}.`}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.category}>{item.category}</span>
                      <strong className={styles.price}>{formatCurrency(item.price)}</strong>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default SearchPage










