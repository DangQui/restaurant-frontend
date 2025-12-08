import { Link } from 'react-router-dom'
import SectionHeading from '@/components/SectionHeading/SectionHeading'
import Button from '@/components/Button/Button'
import { galleryImages } from '../data'
import styles from './VisitSection.module.scss'

const VisitSection = () => (
  <section className={`${styles.visit} page-section`}>
    <div className={styles.container}>
      <div className={styles.gallery}>
        {galleryImages.map((src, index) => (
          <img key={src} src={src} alt={`Gallery ${index + 1}`} />
        ))}
      </div>
      <div className={styles.info}>
        <SectionHeading
          eyebrow="Không gian WowWraps"
          title="Đến WowWraps để cảm nhận trọn vẹn"
          description="Không gian ấm cúng, ánh sáng vàng và nghệ thuật sắp đặt giúp buổi tối của bạn thêm đáng nhớ."
          align="left"
        />

        <div className={styles.schedule}>
          <div>
            <strong>Thứ 2 - Thứ 6</strong>
            <p>10:00 - 22:00</p>
          </div>
          <div>
            <strong>Cuối tuần & Lễ</strong>
            <p>08:00 - 23:00</p>
          </div>
        </div>

        <div className={styles.booking}>
          <div>
            <span>Bàn có sẵn</span>
            <strong>21</strong>
          </div>
          <div>
            <span>Khách mỗi bàn</span>
            <strong>02</strong>
          </div>
          <Button as={Link} to="/reservation" variant="primary">
            Đặt bàn ngay
          </Button>
        </div>
      </div>
    </div>
  </section>
)

export default VisitSection

