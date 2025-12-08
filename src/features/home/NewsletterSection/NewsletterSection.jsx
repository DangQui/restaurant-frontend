import Button from "@/components/Button/Button";
import styles from "./NewsletterSection.module.scss";

const NewsletterSection = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <section className={`${styles.newsletter} page-section`}>
      <div className={styles.container}>
        <div>
          <span className="pill">Bản tin</span>
          <h3>Luôn cập nhật</h3>
          <p>Nhận ưu đãi ẩm thực và sự kiện đặc biệt mỗi tuần.</p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input type="email" placeholder="Email của bạn" required />
          <Button variant="primary" type="submit">
            Đăng ký
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
