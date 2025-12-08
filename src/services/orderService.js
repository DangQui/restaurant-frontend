import { apiClient } from "./apiClient";

/**
 * Map payment method từ frontend sang backend
 */
const mapPaymentMethod = (frontendMethod) => {
  const mapping = {
    "bank-transfer": "card",
    paypal: "card",
    "cash-on-delivery": "cash",
    "check-payments": "cash",
  };
  return mapping[frontendMethod] || "cash";
};

/**
 * Xác định payment status dựa trên payment method
 */
const getPaymentStatus = (paymentMethod) => {
  const onlineMethods = ["bank-transfer", "paypal"];
  return onlineMethods.includes(paymentMethod) ? "completed" : "pending";
};

/**
 * Tạo đơn hàng từ giỏ hàng
 * @param {Object} payload - Thông tin đơn hàng
 * @param {Array} payload.items - Danh sách món trong giỏ
 * @param {string} payload.customerName - Tên khách hàng
 * @param {string} payload.customerPhone - Số điện thoại
 * @param {string} payload.deliveryAddress - Địa chỉ giao hàng
 * @param {string} payload.deliveryNote - Ghi chú giao hàng
 * @param {string} payload.paymentMethod - Phương thức thanh toán
 * @param {number} payload.total - Tổng tiền
 * @param {string} payload.orderType - Loại đơn (delivery/dine-in)
 * @param {number} payload.userId - ID người dùng (nếu có)
 * @returns {Promise<Object>} Đơn hàng đã tạo
 */
export const createOrder = async (payload) => {
  try {
    const {
      items,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryNote,
      paymentMethod,
      total,
      orderType = "delivery",
      userId,
    } = payload;

    // Tạo order
    const orderData = {
      orderType,
      userId: userId || null,
      deliveryAddress: deliveryAddress || null,
      deliveryNote: deliveryNote || null,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      total: total || 0,
      status: "pending",
    };

    const order = await apiClient.post("/orders", {
      body: orderData,
    });

    // Tạo order items
    if (items && items.length > 0) {
      for (const item of items) {
        await apiClient.post(`/orders/${order.id}/items`, {
          body: {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price || 0,
          },
        });
      }
    }

    // Tạo payment
    if (paymentMethod) {
      const backendPaymentMethod = mapPaymentMethod(paymentMethod);
      const paymentStatus = getPaymentStatus(paymentMethod);

      const paymentData = {
        orderId: order.id,
        amount: total || 0,
        method: backendPaymentMethod,
        status: paymentStatus,
      };

      await apiClient.post("/payments", {
        body: paymentData,
      });
    }

    return order;
  } catch (error) {
    console.error("[orderService] Lỗi tạo đơn hàng:", error);
    throw new Error(
      error.message || "Không thể tạo đơn hàng. Vui lòng thử lại."
    );
  }
};

export const orderService = {
  createOrder,
};

export default orderService;
