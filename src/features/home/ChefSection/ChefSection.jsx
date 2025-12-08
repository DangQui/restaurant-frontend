import SectionHeading from '@/components/SectionHeading/SectionHeading'
import { chefs } from '../data'
import styles from './ChefSection.module.scss'

const ChefSection = () => (
  <section className={`${styles.chefs} page-section`}>
    <div className={styles.container}>
      <SectionHeading
        eyebrow="They Will Cook For You"
        title="They Will Cook For You"
        description="Đội ngũ bếp trưởng từng nhận nhiều giải thưởng quốc tế sẽ đồng hành trong từng món ăn."
      />

      <div className={styles.grid}>
        {chefs.map((chef) => (
          <article key={chef.name} className={styles.card}>
            <img src={chef.image} alt={chef.name} />
            <h4>{chef.name}</h4>
            <p>{chef.title}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default ChefSection











