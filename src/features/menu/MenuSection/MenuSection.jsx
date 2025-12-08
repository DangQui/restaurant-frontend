import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import Button from '@/components/Button/Button'
import { formatCurrency } from '@/utils/formatCurrency'
import { useCartContext } from '@/store/CartContext'
import styles from './MenuSection.module.scss'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'

const MenuSection = ({ id, eyebrow, title, description, items = [], loading }) => {
  const [_, setLoopTick] = useState(0)
  const { addItemToCart } = useCartContext()

  const handleControls = (slider) => {
    // Force a rerender so KeenSlider updates arrow states if needed in future
    setLoopTick((tick) => tick + (slider.track?.details?.rel ?? 0))
  }
  const [sliderRef, instanceRef] = useKeenSlider({
    mode: 'free',
    loop: true,
    drag: {
      rubberband: true,
    },
    slides: {
      perView: 1.1,
      spacing: 24,
    },
    breakpoints: {
      '(min-width: 768px)': {
        slides: { perView: 2.1, spacing: 28 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 3.1, spacing: 32 },
      },
    },
    created(slider) {
      handleControls(slider)
    },
    slideChanged(slider) {
      handleControls(slider)
    },
  })

  return (
    <section className={styles.section} id={id}>
      <div className={styles.headerRow}>
        <div>
          {eyebrow ? <span className="pill">{eyebrow}</span> : null}
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            onClick={() => instanceRef.current?.prev()}
            className={styles.navButton}
            aria-label="Xem món trước"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.5 5.5L8 12l6.5 6.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => instanceRef.current?.next()}
            className={styles.navButton}
            aria-label="Xem món tiếp theo"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.5 5.5L16 12l-6.5 6.5" />
            </svg>
          </button>
          <span className={styles.scribble} aria-hidden="true">
            ✦
          </span>
        </div>
      </div>

      {loading ? (
        <div className={styles.placeholder}>
          {[...Array(3)].map((_, index) => (
            <div key={index} className={styles.skeleton} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div ref={sliderRef} className={clsx('keen-slider', styles.slider)}>
          {items.map((item) => (
            <article key={item.id} className={clsx('keen-slider__slide', styles.card)}>
              <Link to={`/menu/${item.id}`} className={styles.cardLink}>
                <div className={styles.cardMedia}>
                  <img src={item.imageUrl || FALLBACK_IMAGE} alt={item.name} loading="lazy" />
                  {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
                </div>
                <div className={styles.cardBody}>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
              </Link>
              <div className={styles.cardFooter}>
                <div>
                  <span className={styles.priceLabel}>Giá</span>
                  <strong className={styles.price}>{formatCurrency(item.price)}</strong>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    addItemToCart({
                      menuItemId: item.id,
                      price: item.price,
                      name: item.name,
                      meta: {
                        imageUrl: item.imageUrl || FALLBACK_IMAGE,
                        description: item.description,
                        category: item.category,
                      },
                    })
                  }
                >
                  {item.ctaLabel || 'Thêm giỏ hàng'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.feedback}>Chưa có món trong mục này.</p>
      )}
    </section>
  )
}

export default MenuSection
