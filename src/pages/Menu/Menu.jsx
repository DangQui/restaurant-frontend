import { Fragment, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button/Button";
import MenuSection from "@/features/menu/MenuSection/MenuSection";
import MenuTabs from "@/features/menu/MenuTabs/MenuTabs";
import { useMenuItems } from "@/hooks/useMenuItems";
import styles from "./Menu.module.scss";

const SECTION_CONFIG = [
  {
    id: "breakfast",
    tabLabel: "Bữa sáng",
    eyebrow: "Nghi thức buổi sáng",
    title: "Bữa sáng",
    description: "Khai mở ngày mới với những món nhẹ thanh và giàu năng lượng.",
  },
  {
    id: "lunch",
    tabLabel: "Bữa trưa",
    eyebrow: "Giữa ngày",
    title: "Bữa trưa",
    description:
      "Ẩm thực cân bằng giữa rau củ và protein giúp bạn tỉnh táo suốt buổi chiều.",
  },
  {
    id: "dinner",
    tabLabel: "Bữa tối",
    eyebrow: "Bữa tiệc hoàng hôn",
    title: "Bữa tối",
    description:
      "Thực đơn fine-dining dành cho những cuộc hẹn và dịp đặc biệt.",
  },
  {
    id: "starters",
    tabLabel: "Khai vị",
    eyebrow: "Khởi động",
    title: "Khai vị",
    description:
      "Chia sẻ niềm vui qua các món nhỏ nhưng đậm phong vị WowWraps.",
  },
];

const MenuPage = () => {
  const { data, loading, error } = useMenuItems({
    limit: 100,
    sortBy: "orderIndex",
    sortDirection: "ASC",
  });

  const sections = useMemo(
    () =>
      SECTION_CONFIG.map((section) => {
        const items = data.filter(
          (item) => (item.category || "").toLowerCase() === section.id
        );
        return { ...section, items };
      }),
    [data]
  );

  const tabSections = sections.map((section) => ({
    id: section.id,
    label: section.tabLabel,
    hasItems: section.items.length > 0,
  }));

  return (
    <div className={styles.page}>
      <section className={styles.intro}>
        <span className="pill">Thực đơn</span>
        <h1>Trải nghiệm vị ngon cho cả ngày dài</h1>
        <p>
          Từ bữa sáng nhẹ nhàng đến bữa tối sang trọng, mỗi món ăn đều được
          chuẩn bị thủ công với nguyên liệu theo mùa. Hãy lướt qua những phần
          bên dưới và chọn phần phù hợp với khoảnh khắc của bạn.
        </p>
      </section>

      <MenuTabs sections={tabSections} />

      {error ? <p className={styles.error}>{error}</p> : null}

      {sections.map((section, index) => (
        <Fragment key={section.id}>
          <MenuSection
            {...section}
            loading={loading && section.items.length === 0}
          />
          {index === 0 ? (
            <section className={styles.hero}>
              <div className={styles.heroContent}>
                <span className="pill">Trải nghiệm</span>
                <h3>Ăn uống không chỉ là nạp năng lượng.</h3>
                <p>
                  Đó là khoảnh khắc ôm trọn cảm xúc, trò chuyện và ghi nhớ từng
                  hương vị tuyệt vời.
                </p>
                <Button as={Link} to="/cart">
                  Đặt món ngay
                </Button>
              </div>
            </section>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
};

export default MenuPage;
