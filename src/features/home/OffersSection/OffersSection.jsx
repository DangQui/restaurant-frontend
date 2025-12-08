import { Link } from 'react-router-dom'
import SectionHeading from '@/components/SectionHeading/SectionHeading'
import { useMenuItems } from '@/hooks/useMenuItems'
import { formatCurrency } from '@/utils/formatCurrency'
import styles from './OffersSection.module.scss'

const OffersSection = () => {
  const { data, loading, error } = useMenuItems({ limit: 3, category: 'dinner' })
  const offers = data.length ? data : []

  return (
    <section className={`${styles.offers} page-section`}>
      <div className={styles.container}>
        <div className={styles.highlight}>
          <span className="pill">Lunch Time</span>
          <h3>Special Lunch 30% Off</h3>
          <p>Áp dụng khi đặt trước từ 11:00 - 13:00 mỗi ngày.</p>
        </div>
        <div className={styles.list}>
          <SectionHeading
            eyebrow="Our Daily Offers"
            title="Our Daily Offers"
            description="Menu món thay đổi mỗi ngày dựa trên nguyên liệu tươi mới nhất."
            align="left"
          />
          {error ? <p className={styles.feedback}>{error}</p> : null}
          {loading ? (
            <p className={styles.feedback}>Đang cập nhật ưu đãi...</p>
          ) : (
            <div className={styles.items}>
              {offers.map((offer) => (
                <Link key={offer.id} to={`/menu/${offer.id}`} className={styles.itemLink}>
                  <div>
                    <h4>{offer.name}</h4>
                    <p>{offer.description || `Phục vụ vào bữa ${offer.category}.`}</p>
                  </div>
                  <span>{formatCurrency(offer.price)}</span>
                </Link>
              ))}
              {!offers.length && !loading ? (
                <p className={styles.feedback}>Chưa có ưu đãi nào.</p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default OffersSection

