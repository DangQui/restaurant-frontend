import SectionHeading from '@/components/SectionHeading/SectionHeading'
import { articles } from '../data'
import styles from './ArticlesSection.module.scss'

const ArticlesSection = () => (
  <section className={`${styles.articles} page-section`}>
    <div className={styles.container}>
      <SectionHeading
        eyebrow="Recent Articles"
        title="Recent Articles"
        description="Những câu chuyện ẩm thực mới nhất từ đội ngũ biên tập của chúng tôi."
      />

      <div className={styles.grid}>
        {articles.map((article) => (
          <article key={article.title}>
            <img src={article.image} alt={article.title} />
            <div>
              <span>{article.date}</span>
              <h4>{article.title}</h4>
              <p>{article.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default ArticlesSection











