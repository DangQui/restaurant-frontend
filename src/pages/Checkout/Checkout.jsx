import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Loading from "@/components/Loading/Loading";
import { useCart } from "@/hooks/useCart";
import { useCartContext } from "@/store/CartContext";
import BillingForm from "@/features/checkout/BillingForm/BillingForm";
import OrderSummary from "@/features/checkout/OrderSummary/OrderSummary";
import PaymentMethods from "@/features/checkout/PaymentMethods/PaymentMethods";
import { orderService } from "@/services/orderService";
import { cartService } from "@/services/cartService";
import styles from "./Checkout.module.scss";
import { useAuthContext } from "@/store/AuthContext";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal, user } = useAuthContext();
  const { refreshCart } = useCartContext();

  const { items, subtotal, shippingFee, total, initialLoading, error, cart } =
    useCart();

  const [billingData, setBillingData] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    deliveryNote: "",
  });

  // Đồng bộ dữ liệu từ cart nếu có
  useEffect(() => {
    if (cart) {
      setBillingData((prev) => ({
        customerName: cart.customerName || prev.customerName,
        customerPhone: cart.customerPhone || prev.customerPhone,
        deliveryAddress: cart.deliveryAddress || prev.deliveryAddress,
        deliveryNote: cart.deliveryNote || prev.deliveryNote,
      }));
    }
  }, [cart]);

  const [paymentMethod, setPaymentMethod] = useState("bank-transfer");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleBillingChange = (field, value) => {
    setBillingData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!acceptedTerms) {
      toast.error("Vui lòng đồng ý với điều khoản để tiếp tục");
      return;
    }

    // Validate required fields
    if (
      !billingData.customerName ||
      !billingData.customerPhone ||
      !billingData.deliveryAddress
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (items.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống");
      return;
    }

    try {
      toast.loading("Đang tạo đơn hàng...", { id: "placing-order" });

      const order = await orderService.createOrder({
        items,
        customerName: billingData.customerName,
        customerPhone: billingData.customerPhone,
        deliveryAddress: billingData.deliveryAddress,
        deliveryNote: billingData.deliveryNote || "",
        paymentMethod,
        total,
        orderType: cart?.orderType || "delivery",
        userId: user?.id || null,
      });

      toast.success("Đặt hàng thành công!", {
        id: "placing-order",
        description: `Mã đơn hàng: #${order.id}`,
      });

      // Xóa giỏ hàng sau khi đặt hàng thành công
      try {
        await cartService.clearCart();
        await refreshCart(); // Refresh để cập nhật UI
      } catch (clearError) {
        console.error("Lỗi khi xóa giỏ hàng:", clearError);
        // Không hiển thị lỗi cho user vì đơn hàng đã được tạo thành công
      }

      // Redirect to orders page or home
      setTimeout(() => {
        navigate("/orders");
      }, 1500);
    } catch (error) {
      toast.error("Không thể tạo đơn hàng", {
        id: "placing-order",
        description: error.message || "Vui lòng thử lại sau",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p>Bạn cần đăng nhập trước khi thanh toán.</p>
          <button type="button" onClick={() => openAuthModal("login")}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return <Loading fullScreen text="Đang tải thông tin đơn hàng..." />;
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.leftSection}>
            <BillingForm data={billingData} onChange={handleBillingChange} />
          </div>

          <div className={styles.rightSection}>
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shippingFee={shippingFee}
              total={total}
            />

            <PaymentMethods
              selected={paymentMethod}
              onSelect={setPaymentMethod}
              onPaymentInfoChange={setPaymentInfo}
            />

            <div className={styles.terms}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span>
                  Dữ liệu cá nhân của bạn sẽ được sử dụng để xử lý đơn hàng, hỗ
                  trợ trải nghiệm của bạn trên trang web này, và cho các mục
                  đích khác được mô tả trong{" "}
                  <a href="/privacy" target="_blank">
                    chính sách bảo mật
                  </a>{" "}
                  của chúng tôi.
                </span>
              </label>
            </div>

            <button
              type="button"
              className={styles.placeOrderButton}
              onClick={handlePlaceOrder}
              disabled={!acceptedTerms}>
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
