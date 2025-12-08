import { ClipLoader } from 'react-spinners'
import clsx from 'clsx'
import styles from './Loading.module.scss'

const Loading = ({ size = 40, color, fullScreen = false, text, className }) => {
  const spinnerColor = color || '#faae39'

  if (fullScreen) {
    return (
      <div className={clsx(styles.fullScreen, className)}>
        <div className={styles.content}>
          <ClipLoader color={spinnerColor} size={size} />
          {text && <p className={styles.text}>{text}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={clsx(styles.inline, className)}>
      <ClipLoader color={spinnerColor} size={size} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  )
}

export default Loading










