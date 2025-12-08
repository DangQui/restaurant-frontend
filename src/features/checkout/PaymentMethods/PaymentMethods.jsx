import { useState, useEffect } from "react";
import styles from "./PaymentMethods.module.scss";

const paymentOptions = [
  {
    id: "bank-transfer",
    label: "Chuyển khoản ngân hàng",
    description:
      "Thanh toán trực tiếp vào tài khoản ngân hàng của chúng tôi. Vui lòng sử dụng Mã đơn hàng làm nội dung chuyển khoản. Đơn hàng sẽ được giao sau khi chúng tôi xác nhận đã nhận được thanh toán.",
    isOnline: true,
  },
  {
    id: "check-payments",
    label: "Thanh toán bằng séc",
    description: "Vui lòng gửi séc đến địa chỉ cửa hàng của chúng tôi.",
    isOnline: false,
  },
  {
    id: "cash-on-delivery",
    label: "Thanh toán khi nhận hàng",
    description: "Thanh toán bằng tiền mặt khi nhận hàng.",
    isOnline: false,
  },
  {
    id: "paypal",
    label: "PayPal",
    description:
      "Thanh toán qua PayPal; bạn có thể thanh toán bằng thẻ tín dụng nếu không có tài khoản PayPal.",
    isOnline: true,
  },
];

const PaymentMethods = ({ selected, onSelect, onPaymentInfoChange }) => {
  const selectedOption = paymentOptions.find((opt) => opt.id === selected);
  const isOnlinePayment = selectedOption?.isOnline || false;

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    if (onPaymentInfoChange) {
      onPaymentInfoChange(isOnlinePayment ? paymentInfo : null);
    }
  }, [paymentInfo, isOnlinePayment, onPaymentInfoChange]);

  const handlePaymentInfoChange = (field, value) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.methods}>
      {paymentOptions.map((option) => (
        <div key={option.id} className={styles.methodOption}>
          <label className={styles.methodLabel}>
            <input
              type="radio"
              name="payment-method"
              value={option.id}
              checked={selected === option.id}
              onChange={(e) => onSelect(e.target.value)}
            />
            <span className={styles.radioCustom} />
            <span className={styles.methodName}>{option.label}</span>
          </label>

          {selected === option.id && (
            <>
              <div className={styles.methodDescription}>
                {option.description}
              </div>

              {isOnlinePayment && (
                <div className={styles.paymentInfoForm}>
                  <h4 className={styles.paymentInfoTitle}>
                    Thông tin thanh toán
                  </h4>

                  <label className={styles.paymentField}>
                    <span>
                      Số thẻ <span className={styles.required}>*</span>
                    </span>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={(e) =>
                        handlePaymentInfoChange("cardNumber", e.target.value)
                      }
                      maxLength={19}
                    />
                  </label>

                  <label className={styles.paymentField}>
                    <span>
                      Tên trên thẻ <span className={styles.required}>*</span>
                    </span>
                    <input
                      type="text"
                      placeholder="NGUYEN VAN A"
                      value={paymentInfo.cardName}
                      onChange={(e) =>
                        handlePaymentInfoChange("cardName", e.target.value)
                      }
                    />
                  </label>

                  <div className={styles.paymentGrid}>
                    <label className={styles.paymentField}>
                      <span>
                        Ngày hết hạn <span className={styles.required}>*</span>
                      </span>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentInfo.expiryDate}
                        onChange={(e) =>
                          handlePaymentInfoChange("expiryDate", e.target.value)
                        }
                        maxLength={5}
                      />
                    </label>

                    <label className={styles.paymentField}>
                      <span>
                        CVV <span className={styles.required}>*</span>
                      </span>
                      <input
                        type="text"
                        placeholder="123"
                        value={paymentInfo.cvv}
                        onChange={(e) =>
                          handlePaymentInfoChange("cvv", e.target.value)
                        }
                        maxLength={4}
                      />
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default PaymentMethods;
