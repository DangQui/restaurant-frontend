import Button from '@/components/Button/Button'
import Tagline from '@/components/Tagline/Tagline'
import { useMenuItems } from '@/hooks/useMenuItems'
import styles from './HeroSection.module.scss'

const HeroSection = () => {
  const { pagination } = useMenuItems({ limit: 1 })
  const menuCount = pagination?.total ?? 0

  return (
    <section className={`${styles.hero} page-section`}>
      <div className={styles.container}>
        <div>
          <Tagline>About Us</Tagline>
          <h1>
            We Are A Mexican Restaurant
            <br />
            Makes Delicious.
          </h1>
          <p>
            Hơn 20 năm trong ngành ẩm thực, chúng tôi tái hiện những món Mexico kinh điển với cảm
            hứng fusion. Đội ngũ đã phục vụ hơn {menuCount} món khác nhau trong thực đơn, cùng mục
            tiêu giữ trọn vẹn cảm xúc cho từng vị khách.
          </p>
          <div className={styles.meta}>
            <span>11:24 we&apos;re open</span>
            <span>Table Reservation</span>
          </div>
          <Button variant="primary" size="lg">
            Book A Table
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection











