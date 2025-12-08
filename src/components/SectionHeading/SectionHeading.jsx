import styles from './SectionHeading.module.scss'

const SectionHeading = ({ eyebrow, title, description, align = 'center' }) => {
  return (
    <div className={styles.wrapper} data-align={align}>
      {eyebrow ? <span className="pill">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  )
}

export default SectionHeading











