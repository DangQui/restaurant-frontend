import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/store/AuthContext";
import styles from "./AvatarMenu.module.scss";

const menuItems = [
  { label: "Trang cá nhân", path: "/profile", icon: "👤" },
  { label: "Cài đặt", path: "/settings", icon: "⚙️" },
  { label: "Lịch sử mua hàng", path: "/orders", icon: "🧾" },
  { label: "Theo dõi đơn", path: "/tracking", icon: "📦" },
];

const AvatarMenu = () => {
  const { user, logout } = useAuthContext();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const initials = useMemo(() => {
    const value = user?.name || user?.email || "";
    return value.trim().charAt(0).toUpperCase();
  }, [user]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.avatar}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Tài khoản">
        {initials || "?"}
      </button>

      {open ? (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <p>{user?.name || "Thành viên"}</p>
            <span>{user?.email}</span>
          </div>

          <nav>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className={styles.logout}
            onClick={handleLogout}>
            <span>🚪</span>Đăng xuất
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default AvatarMenu;
