import { NavLink } from "react-router-dom";
import clsx from "clsx";
import LogoButton from "@/components/Logo/LogoButton";
import SearchBar from "@/components/SearchBar/SearchBar";
import Badge from "@/components/Badge/Badge";
import AvatarMenu from "@/components/AvatarMenu/AvatarMenu";
import { useLogoNavigation } from "@/hooks/useLogoNavigation";
import { useCartContext } from "@/store/CartContext";
import { useAuthContext } from "@/store/AuthContext";
import styles from "./Header.module.scss";

const navItems = [
  { path: "/", label: "Trang chủ" },
  { path: "/menu", label: "Thực đơn" },
  { path: "/blog", label: "Blog" },
  { path: "/pages", label: "Trang" },
  { path: "/contact", label: "Liên hệ" },
];

const Header = () => {
  const currentTime = new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const handleLogoClick = useLogoNavigation();
  const { distinctCount } = useCartContext();
  const { isAuthenticated, openAuthModal } = useAuthContext();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <nav className={styles.navLeft}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => (isActive ? styles.active : "")}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <SearchBar className={styles.searchBar} />
        </div>

        <div className={styles.logoWrapper}>
          <LogoButton onClick={handleLogoClick} />
        </div>

        <div className={styles.rightSection}>
          <span className={styles.status}>
            {currentTime} chúng tôi đang mở cửa
          </span>
          <NavLink to="/reservation" className={styles.reservationLink}>
            Đặt bàn
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              clsx(styles.cartButton, isActive && styles.cartButtonActive)
            }
            aria-label="Giỏ hàng">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6h15l-1.5 8h-11z" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M6 6 4 3H2" />
            </svg>
            <span>Giỏ hàng</span>
            {distinctCount > 0 ? (
              <Badge variant="accent" className={styles.cartBadge}>
                {distinctCount}
              </Badge>
            ) : null}
          </NavLink>
          {isAuthenticated ? (
            <AvatarMenu />
          ) : (
            <button
              type="button"
              className={styles.loginBtn}
              onClick={() => openAuthModal("login")}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
