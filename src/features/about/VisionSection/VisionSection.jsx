import SectionHeading from '@/components/SectionHeading/SectionHeading'
import { useMenuItems } from '@/hooks/useMenuItems'
import { missionFeatures } from '../aboutData'
import styles from './VisionSection.module.scss'

const VisionSection = () => {
  const { data } = useMenuItems({ limit: 1 })
  const highlightDish = data[0]

  return (
    <section className={`${styles.vision} page-section`}>
      <div className={styles.container}>
        <div>
          <SectionHeading
            eyebrow="Our Vision & Mission"
            title="Our Vision & Mission"
            description="Giữ trọn bản sắc Mexico và sáng tạo cùng nguồn nguyên liệu bản địa để phục vụ trải nghiệm cao cấp nhưng vẫn gần gũi."
            align="left"
          />
          <ul className={styles.features}>
            {missionFeatures.map((feature) => (
              <li key={feature.title}>
                <span className={styles.icon}>{feature.icon}</span>
                <div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.figure}>
          <img
            src={
              highlightDish
                ? `https://source.unsplash.com/featured/?mexican-food,${highlightDish.name}`
                : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
            }
            alt={highlightDish?.name || 'Signature dish'}
          />
          {highlightDish ? (
            <div className={styles.badge}>
              <span>Signature Dish</span>
              <strong>{highlightDish.name}</strong>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default VisionSection











