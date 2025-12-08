import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button/Button";
import styles from "./Pages.module.scss";

const initialCountdown = {
  days: 98,
  hours: 3,
  minutes: 25,
  seconds: 12,
};

const PagesPage = () => {
  const navigate = useNavigate();
  // Dữ liệu cứng, không cần đếm ngược thực tế
  const [countdown] = useState(initialCountdown);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.leftColumn}>
          <p className={styles.eyebrow}>Ưu đãi đặc biệt</p>
          <h1 className={styles.title}>
            Đăng ký nhận bản tin
            <br />
            để không bỏ lỡ tin mới
          </h1>
          <p className={styles.subtitle}>
            Mỗi tuần, chúng tôi gửi tới bạn những câu chuyện ẩm thực, bí quyết
            quản lý nhà hàng và các ưu đãi độc quyền chỉ dành cho thành viên bản
            tin.
          </p>

          <div className={styles.countdown}>
            <div className={styles.countItem}>
              <span className={styles.countNumber}>{countdown.days}</span>
              <span className={styles.countLabel}>Ngày</span>
            </div>
            <div className={styles.countItem}>
              <span className={styles.countNumber}>
                {String(countdown.hours).padStart(2, "0")}
              </span>
              <span className={styles.countLabel}>Giờ</span>
            </div>
            <div className={styles.countItem}>
              <span className={styles.countNumber}>
                {String(countdown.minutes).padStart(2, "0")}
              </span>
              <span className={styles.countLabel}>Phút</span>
            </div>
            <div className={styles.countItem}>
              <span className={styles.countNumber}>
                {String(countdown.seconds).padStart(2, "0")}
              </span>
              <span className={styles.countLabel}>Giây</span>
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" size="md" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.heroImageWrapper}>
            <img
              src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=900&h=700&fit=crop"
              alt="Món ăn đặc sắc"
            />
            <span className={styles.decorStar}>✺</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PagesPage;
