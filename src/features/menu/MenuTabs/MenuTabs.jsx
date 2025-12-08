import { useMemo, useState } from 'react'
import styles from './MenuTabs.module.scss'

const MenuTabs = ({ sections = [] }) => {
  const fallbackId = useMemo(() => {
    return sections.find((section) => section.hasItems)?.id ?? sections[0]?.id
  }, [sections])

  const [activeId, setActiveId] = useState(() => fallbackId)

  const resolvedActiveId = sections.some((section) => section.id === activeId) ? activeId : fallbackId

  const handleClick = (id, disabled) => {
    if (disabled) return
    setActiveId(id)
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.tabs}>
      {sections.map((section) => {
        const disabled = !section.hasItems
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => handleClick(section.id, disabled)}
            data-active={resolvedActiveId === section.id}
            disabled={disabled}
          >
            {section.label}
          </button>
        )
      })}
    </div>
  )
}

export default MenuTabs
