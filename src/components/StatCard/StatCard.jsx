import styles from './StatCard.module.scss'

const StatCard = ({ value, label }) => (
  <div className={styles.card}>
    <span className={styles.value}>{value}</span>
    <span className={styles.label}>{label}</span>
  </div>
)

export default StatCard











