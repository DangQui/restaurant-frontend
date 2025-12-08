import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading/SectionHeading";
import { useMenuItems } from "@/hooks/useMenuItems";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./MenuSection.module.scss";

const toTitleCase = (text = "") =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

const MenuSection = () => {
  const [active, setActive] = useState("All");
  const { data, loading, error } = useMenuItems({ limit: 50 });

  const categoryLabels = {
    All: "Tất cả",
    Breakfast: "Bữa sáng",
    Lunch: "Bữa trưa",
    Dinner: "Bữa tối",
    Appetizer: "Khai vị",
    Dessert: "Tráng miệng",
    Drink: "Đồ uống",
  };

  const categories = useMemo(
    () => ["All", ...new Set(data.map((item) => toTitleCase(item.category)))],
    [data]
  );

  const items =
    active === "All"
      ? data
      : data.filter((item) => toTitleCase(item.category) === active);

  return (
    <section className={`${styles.menu} page-section`}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow="Choose & Taste"
          title="Choose & Taste What You Like"
          description="Thực đơn được thiết kế để bạn khám phá khẩu vị riêng qua từng phần."
        />

        <div className={styles.tabs}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              data-active={active === category}>
              {categoryLabels[category] || category}
            </button>
          ))}
        </div>

        {error ? <p className={styles.feedback}>{error}</p> : null}

        {loading ? (
          <p className={styles.feedback}>Đang tải thực đơn...</p>
        ) : (
          <div className={styles.listWrapper}>
            <div className={styles.list}>
              {items.length > 0 ? (
                items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/menu/${item.id}`}
                    className={styles.row}>
                    <div>
                      <h4>{item.name}</h4>
                      <span>{toTitleCase(item.category)}</span>
                    </div>
                    <span className={styles.price}>
                      {formatCurrency(item.price)}
                    </span>
                  </Link>
                ))
              ) : (
                <p className={styles.feedback}>Chưa có món thuộc nhóm này.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
