import clsx from 'clsx'
import styles from './Button.module.scss'

const Button = ({ as, children, variant = 'primary', size = 'md', icon, className, ...props }) => {
  const Component = as || 'button'
  return (
    <Component className={clsx(styles.button, styles[variant], styles[size], className)} {...props}>
      <span>{children}</span>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
    </Component>
  )
}

export default Button


