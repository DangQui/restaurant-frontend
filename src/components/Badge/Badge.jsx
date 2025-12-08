import clsx from 'clsx'
import styles from './Badge.module.scss'

const Badge = ({ children, variant = 'default', className }) => {
  return <span className={clsx(styles.badge, styles[variant], className)}>{children}</span>
}

export default Badge




