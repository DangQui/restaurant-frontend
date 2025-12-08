import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import clsx from "clsx";
import Button from "@/components/Button/Button";
import Loading from "@/components/Loading/Loading";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./Cart.module.scss";
import { useAuthContext } from "@/store/AuthContext";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    openAuthModal,
    loading: authLoading,
  } = useAuthContext();

  const {
    items,
    subtotal,
    shippingFee,
    discount,
    total,
    initialLoading,
    error,
    refresh,
    cart,
    couponStatus,
    updateItemQuantity,
    removeItem,
    applyCoupon,
    hasPendingSync,
    syncingChanges,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");

  const handleQuantityChange = (itemId, nextQuantity) => {
    if (nextQuantity < 1) return;
    updateItemQuantity(itemId, nextQuantity);
  };

  const handleApplyCoupon = (event) => {
    event.preventDefault();
    applyCoupon(couponInput);
  };

  const shippingLabel = useMemo(() => {
    if (!cart?.orderType) return "Đơn tiêu chuẩn";
    return cart.orderType === "delivery" ? "Giao tận nơi" : "Dùng tại nhà hàng";
  }, [cart?.orderType]);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (items.length === 0) {
      toast.error("Giỏ hàng trống", {
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán",
      });
      return;
    }

    navigate("/checkout");
  };

  if (authLoading) {
    return <Loading fullScreen text="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className="pill">Giỏ hàng</span>
            <h1>Vui lòng đăng nhập</h1>
            <p>
              Giỏ hàng được bảo lưu trong tài khoản của bạn. Đăng nhập để xem và
              tiếp tục đặt món.
            </p>
            <Button onClick={() => openAuthModal("login")}>Đăng nhập</Button>
          </div>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return <Loading fullScreen text="Đang tải giỏ hàng..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <span className="pill">Giỏ hàng</span>
          <h1>Giữ trọn cảm hứng ẩm thực</h1>
          <p>
            Kiểm tra lại những món bạn đã chọn trước khi thanh toán. Bạn có thể
            điều chỉnh số lượng, áp dụng ưu đãi hoặc thay đổi địa chỉ nhận món
            chỉ trong vài giây.
          </p>
          <div className={styles.heroMeta}>
            <span>Mã giỏ #{cart?.id || "đang cập nhật"}</span>
            <span>Hình thức: {shippingLabel}</span>
          </div>
        </div>
      </div>

      {error ? (
        <div className={styles.errorBox}>
          <p>{error}</p>
          <Button variant="secondary" onClick={refresh}>
            Thử lại
          </Button>
        </div>
      ) : null}

      <div className={styles.layout}>
        <section className={styles.cartPanel}>
          {hasPendingSync ? (
            <p className={styles.syncNotice}>
              Đang chờ cập nhật thay đổi của bạn...
            </p>
          ) : null}
          {syncingChanges ? (
            <p className={styles.syncNotice}>Đang đồng bộ với máy chủ...</p>
          ) : null}
          <div className={styles.tableHeader}>
            <span>Món ăn</span>
            <span>Đơn giá</span>
            <span>Số lượng</span>
            <span>Tạm tính</span>
          </div>

          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Giỏ hàng của bạn đang trống. Hãy thêm món để tiếp tục nhé.</p>
              <Button as={Link} to="/menu">
                Khám phá thực đơn
              </Button>
            </div>
          ) : (
            <>
              {items.map((item) => {
                return (
                  <article key={item.id} className={styles.row}>
                    <div className={styles.foodCell}>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeItem(item.id)}
                        disabled={syncingChanges}
                        aria-label={`Xoá ${item.name}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M9 3h6a1 1 0 0 1 .993.883L16 4v1h4a1 1 0 0 1 .117 1.993L20 7h-1.047l-.845 11.828A2.5 2.5 0 0 1 15.62 21H8.38a2.5 2.5 0 0 1-2.488-2.172L5.047 7H4a1 1 0 0 1-.117-1.993L4 5h4V4a1 1 0 0 1 1-1zm5 6a1 1 0 0 0-1 .883L13 10v7a1 1 0 0 0 1.993.117L15 17v-7a1 1 0 0 0-1-1m-4 0a1 1 0 0 0-.993.883L9 10v7a1 1 0 0 0 1.993.117L11 17v-7a1 1 0 0 0-1-1m2-4h-2v1h2z"
                          />
                        </svg>
                      </button>
                      <div className={styles.thumbnail}>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className={styles.foodName}>{item.name}</p>
                        <p className={styles.foodMeta}>{item.description}</p>
                      </div>
                    </div>

                    <div className={styles.priceCell}>
                      {formatCurrency(item.price)}
                    </div>

                    <div className={styles.quantityCell}>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1 || syncingChanges}>
                        –
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        disabled={syncingChanges}>
                        +
                      </button>
                    </div>

                    <div className={styles.subtotalCell}>
                      {formatCurrency(item.subtotal)}
                    </div>
                  </article>
                );
              })}

              <form className={styles.couponRow} onSubmit={handleApplyCoupon}>
                <label htmlFor="coupon" className="sr-only">
                  Nhập mã giảm giá
                </label>
                <input
                  id="coupon"
                  type="text"
                  placeholder="Nhập mã ưu đãi"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                />
                <Button type="submit" disabled={couponStatus === "loading"}>
                  {couponStatus === "loading"
                    ? "Đang áp dụng..."
                    : "Áp dụng mã"}
                </Button>
              </form>
            </>
          )}
        </section>

        <aside className={styles.summaryPanel}>
          <h2>Tổng quan đơn hàng</h2>
          <div className={styles.summaryRow}>
            <span>Tạm tính</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Ưu đãi</span>
            <span>-{discount ? formatCurrency(discount) : "0 ₫"}</span>
          </div>
          <div className={styles.summaryRow}>
            <div>
              <p>Phí giao món</p>
              <small>
                {cart?.deliveryAddress
                  ? `Giao tới ${cart.deliveryAddress}`
                  : "Cập nhật địa chỉ để tính phí chính xác"}
              </small>
            </div>
            <span>{shippingFee ? formatCurrency(shippingFee) : "0 ₫"}</span>
          </div>

          <div className={clsx(styles.summaryRow, styles.totalRow)}>
            <span>Tổng cộng</span>
            <strong>{formatCurrency(total)}</strong>
          </div>

          <Button
            className={styles.checkoutButton}
            onClick={handleCheckout}
            disabled={items.length === 0}>
            Tiến hành thanh toán
          </Button>
          <p className={styles.helperText}>
            Chúng tôi sẽ giữ đơn hàng trong vòng 15 phút để bạn hoàn tất thanh
            toán.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
