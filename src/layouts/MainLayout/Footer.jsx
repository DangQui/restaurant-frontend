import { NavLink } from "react-router-dom";
import LogoButton from "@/components/Logo/LogoButton";
import { useLogoNavigation } from "@/hooks/useLogoNavigation";
import styles from "./Footer.module.scss";

const Footer = () => {
  const handleLogoClick = useLogoNavigation();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandSection}>
          <div className={styles.logoWrapper}>
            <LogoButton onClick={handleLogoClick} />
          </div>
          <h5 className={styles.brandName}>WowWraps</h5>
          <p className={styles.downloadText}>
            Tải ứng dụng WowWraps để đặt món mọi lúc.
          </p>
          <div className={styles.appButtons}>
            {/* App Store button - user tự thêm */}
            <a href="#" className={styles.appButton}>
              <img
                src="../../../public/images/AppStore.png"
                alt="Download on the App Store"
              />
            </a>
            {/* Google Play button - user tự thêm */}
            <a href="#" className={styles.appButton}>
              <img
                src="../../../public/images/GooglePlay.png"
                alt="GET IT ON Google Play"
              />
            </a>
          </div>
        </div>

        <div className={styles.section}>
          <h6 className={styles.sectionTitle}>Liên kết hữu ích</h6>
          <nav className={styles.linkList}>
            <NavLink to="/">Trang chủ</NavLink>
            <NavLink to="/about">Về chúng tôi</NavLink>
            <NavLink to="/services">Dịch vụ</NavLink>
            <NavLink to="/reservation">Đặt bàn</NavLink>
            <NavLink to="/menu">Thực đơn</NavLink>
          </nav>
        </div>

        <div className={styles.section}>
          <h6 className={styles.sectionTitle}>Thông tin liên hệ</h6>
          <div className={styles.contactList}>
            <p>Silk St, Barbican, London</p>
            <p>EC2Y 8DS, UK</p>
            <p>info@example.com</p>
            <p>800-123-45-678</p>
          </div>
        </div>

        <div className={styles.section}>
          <h6 className={styles.sectionTitle}>Kết nối với chúng tôi</h6>
          <nav className={styles.socialList}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              Linkedin
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              Twitter
            </a>
          </nav>
        </div>

        <div className={styles.section}>
          <h6 className={styles.sectionTitle}>Pháp lý</h6>
          <div className={styles.legalList}>
            <p>Thiết kế bởi Quí, Cường</p>
            <p>©2025. Giữ toàn bộ bản quyền.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
