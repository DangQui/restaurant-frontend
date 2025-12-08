import { Link } from 'react-router-dom'
import SectionHeading from '@/components/SectionHeading/SectionHeading'
import Loading from '@/components/Loading/Loading'
import { useMenuItems } from '@/hooks/useMenuItems'
import { formatCurrency } from '@/utils/formatCurrency'
import styles from './PopularSection.module.scss'

const fallbackImages = {
  breakfast: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=600&q=80',
  lunch: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=600&q=80',
  dinner: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=600&q=80',
  appetizer: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=600&q=80',
  dessert: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80',
  drink: 'https://images.unsplash.com/photo-1453827432871-8b9043c06c1c?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
}

const PopularSection = () => {
  const { data, loading, error } = useMenuItems({ limit: 3, type: 'food' })

  return (
    <section className={`${styles.popular} page-section`}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow="Most Popular"
          title="Most Popular Food"
          description="Những món ăn được yêu thích nhất mùa này, hội tụ nguyên liệu phiên bản giới hạn và kỹ thuật trình bày tinh tế."
        />

        {error ? (
          <p className={styles.feedback}>{error}</p>
        ) : null}

        {loading ? (
          <Loading text="Đang tải món ăn nổi bật..." />
        ) : (
          <div className={styles.grid}>
            {data.map((item) => (
              <Link key={item.id} to={`/menu/${item.id}`} className={styles.card}>
                <img src={fallbackImages[item.category] || fallbackImages.default} alt={item.name} />
                <div className={styles.body}>
                  <header>
                    <h3>{item.name}</h3>
                    <span className={styles.price}>{formatCurrency(item.price)}</span>
                  </header>
                  <p>{item.description || 'Món đặc biệt theo mùa từ bếp trưởng.'}</p>
                  <div className={styles.meta}>
                    <span>{item.category}</span>
                    <span>{item.type}</span>
                  </div>
                </div>
              </Link>
            ))}
            {!data.length && !loading ? <p className={styles.feedback}>Chưa có món nào.</p> : null}
          </div>
        )}
      </div>
    </section>
  )
}

export default PopularSection

