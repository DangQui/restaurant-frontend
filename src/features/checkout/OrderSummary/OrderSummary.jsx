import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./OrderSummary.module.scss";

const OrderSummary = ({ items, subtotal, shippingFee, total }) => {
  return (
    <div className={styles.summary}>
      <h2 className={styles.title}>Đơn hàng của bạn</h2>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Món ăn</span>
          <span>Tạm tính</span>
        </div>

        <div className={styles.tableBody}>
          {items.map((item) => (
            <div key={item.id} className={styles.row}>
              <div className={styles.foodInfo}>
                <span className={styles.foodName}>{item.name}</span>
                <span className={styles.quantity}>x {item.quantity}</span>
              </div>
              <span className={styles.price}>
                {formatCurrency(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.tableFoot}>
          <div className={styles.summaryRow}>
            <span>Tạm tính</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Phí giao hàng</span>
            <div className={styles.shippingInfo}>
              <span className={styles.shippingLabel}>
                Phí cố định: {formatCurrency(shippingFee)}
              </span>
            </div>
          </div>

          <div className={styles.totalRow}>
            <span>Tổng cộng</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
