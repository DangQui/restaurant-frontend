import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/Button/Button'
import StatCard from '@/components/StatCard/StatCard'
import Tagline from '@/components/Tagline/Tagline'
import { baseStats } from '../data'
import { useMenuItems } from '@/hooks/useMenuItems'
import styles from './HeroSection.module.scss'

const HeroSection = () => {
  const { pagination } = useMenuItems({ limit: 1 })

  const stats = useMemo(() => {
    if (!pagination?.total) return baseStats

    return baseStats.map((item) =>
      item.label === 'Món đặc sắc'
        ? { ...item, value: pagination.total.toString().padStart(2, '0') }
        : item,
    )
  }, [pagination])

  return (
    <section className={`${styles.hero} page-section`}>
      <div className={styles.container}>
        <div className={styles.content}>
          <Tagline>Trải nghiệm đặc trưng</Tagline>
          <h1>
            Chúng tôi không chỉ nấu ăn,
            <br />
            chúng tôi tạo nên cảm xúc!
          </h1>
          <p>
            Hơn 15 năm đồng hành cùng giới sành ăn với thực đơn fusion độc đáo, WowWraps mang đến trải nghiệm ẩm thực
            tinh tế, nơi mỗi nguyên liệu đều kể một câu chuyện riêng.
          </p>
          <div className={styles.actionRow}>
            <Button as={Link} to="/menu" variant="primary" size="lg">
              Khám phá thực đơn
            </Button>
            <Button as={Link} to="/reservation" variant="secondary" size="lg">
              Đặt bàn tức thì
            </Button>
          </div>
          <div className={styles.stats}>
            {stats.map((item) => (
              <StatCard key={item.label} value={item.value} label={item.label} />
            ))}
          </div>
        </div>
        <div className={styles.figure}>
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80"
            alt="Hero dish"
          />
          <div className={styles.badge}>
            <span>Chef Special</span>
            <strong>New Seasonal Menu</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

