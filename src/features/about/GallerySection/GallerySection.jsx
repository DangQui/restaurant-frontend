import SectionHeading from '@/components/SectionHeading/SectionHeading'
import { galleryImages } from '../aboutData'
import styles from './GallerySection.module.scss'

const GallerySection = () => (
  <section className={`${styles.gallery} page-section`}>
    <div className={styles.container}>
      <div className={styles.images}>
        {galleryImages.slice(0, 3).map((src, index) => (
          <img key={src} src={src} alt={`Gallery ${index + 1}`} />
        ))}
      </div>
      <div className={styles.story}>
        <SectionHeading
          align="left"
          eyebrow="The Story Of Our First Restaurant Branch"
          title="The Story Of Our First Restaurant Branch"
          description="Từ một quán nhỏ ở phố cổ, chúng tôi phát triển thành chuỗi nhà hàng với không gian ấm áp, nơi những câu chuyện văn hóa Mexico được kể lại qua từng món ăn."
        />
        <p>
          Mỗi chi nhánh đều giữ nguyên tinh thần ban đầu: bếp mở, ánh sáng vàng và âm nhạc Latin
          sống động. Chúng tôi tin rằng ẩm thực là cầu nối cảm xúc giữa con người.
        </p>
      </div>
    </div>
  </section>
)

export default GallerySection











