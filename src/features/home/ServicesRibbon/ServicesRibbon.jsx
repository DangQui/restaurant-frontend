import { services } from '../data'
import styles from './ServicesRibbon.module.scss'

const ServicesRibbon = () => (
  <section className={styles.ribbon} aria-label="Service highlights">
    <div className={styles.track}>
      {services.map((service) => (
        <span key={service}>{service}</span>
      ))}
    </div>
  </section>
)

export default ServicesRibbon











