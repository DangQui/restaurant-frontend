import styles from "./BillingForm.module.scss";
import Textarea from "@/components/Textarea/Textarea";

const BillingForm = ({ data, onChange }) => {
  return (
    <div className={styles.form}>
      <h1 className={styles.title}>Thông tin giao hàng</h1>

      <label className={styles.field}>
        <span>
          Họ tên <span className={styles.required}>*</span>
        </span>
        <input
          type="text"
          value={data.customerName}
          onChange={(e) => onChange("customerName", e.target.value)}
          placeholder="Ví dụ: Nguyễn Minh Anh"
          required
        />
      </label>

      <label className={styles.field}>
        <span>
          Số điện thoại <span className={styles.required}>*</span>
        </span>
        <input
          type="tel"
          value={data.customerPhone}
          onChange={(e) => onChange("customerPhone", e.target.value)}
          placeholder="0987 654 321"
          required
        />
      </label>

      <label className={styles.field}>
        <span>
          Địa chỉ giao hàng <span className={styles.required}>*</span>
        </span>
        <Textarea
          rows={3}
          value={data.deliveryAddress}
          onChange={(e) => onChange("deliveryAddress", e.target.value)}
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          required
        />
      </label>

      <label className={styles.field}>
        <span>Ghi chú cho tài xế (tùy chọn)</span>
        <Textarea
          rows={2}
          value={data.deliveryNote}
          onChange={(e) => onChange("deliveryNote", e.target.value)}
          placeholder="Ví dụ: Gọi trước 5 phút, gửi bảo vệ..."
        />
      </label>
    </div>
  );
};

export default BillingForm;
