import { apiClient } from "./apiClient";
import { mockCartApi } from "./cartMock";

const CAN_FALLBACK_TO_MOCK = import.meta.env.VITE_USE_CART_MOCK === "true";

const pickBody = (payload = {}) => {
  const { meta: _meta, ...rest } = payload;
  return rest;
};

const withFallback = async (apiCall, mockCall) => {
  try {
    return await apiCall();
  } catch (error) {
    if (!CAN_FALLBACK_TO_MOCK) {
      throw error;
    }
    console.warn(
      "[cartService] Backend không sẵn sàng, chuyển sang dữ liệu mock.",
      error.message || error
    );
    return mockCall();
  }
};

export const getActiveCart = () => {
  return withFallback(
    () => apiClient.get("/api/carts/me"),
    () => mockCartApi.getCart()
  );
};

export const addItemToActiveCart = (payload) => {
  if (!payload?.menuItemId) {
    throw new Error("Thiếu món ăn cần thêm");
  }
  return withFallback(
    () =>
      apiClient.post("/api/carts/me/items", {
        body: pickBody(payload),
      }),
    () => mockCartApi.addItem(payload)
  );
};

export const updateActiveCartItem = (itemId, quantity) => {
  if (!itemId) {
    throw new Error("Thiếu mã món ăn trong giỏ");
  }
  return withFallback(
    () =>
      apiClient.put(`/api/carts/me/items/${itemId}`, {
        body: { quantity },
      }),
    () => mockCartApi.updateItem(itemId, quantity)
  );
};

export const removeActiveCartItem = (itemId) => {
  if (!itemId) {
    throw new Error("Thiếu mã món ăn trong giỏ");
  }
  return withFallback(
    () => apiClient.delete(`/api/carts/me/items/${itemId}`),
    () => mockCartApi.removeItem(itemId)
  );
};

export const updateCartDetails = (body) => {
  return withFallback(
    () =>
      apiClient.put("/api/carts/me/details", {
        body,
      }),
    () => mockCartApi.updateDetails(body)
  );
};

export const clearCart = async () => {
  try {
    // Lấy giỏ hàng hiện tại
    const cart = await getActiveCart();
    if (!cart || !cart.items || cart.items.length === 0) {
      return { success: true, message: "Giỏ hàng đã trống" };
    }

    // Xóa từng item trong giỏ hàng
    const deletePromises = cart.items.map((item) =>
      removeActiveCartItem(item.id).catch((err) => {
        console.warn(`Không thể xóa item ${item.id}:`, err);
        return null;
      })
    );

    await Promise.all(deletePromises);
    return { success: true, message: "Đã xóa giỏ hàng" };
  } catch (error) {
    console.error("[cartService] Lỗi xóa giỏ hàng:", error);
    throw new Error(error.message || "Không thể xóa giỏ hàng");
  }
};

export const cartService = {
  getCart: getActiveCart,
  addItem: addItemToActiveCart,
  updateItem: updateActiveCartItem,
  removeItem: removeActiveCartItem,
  saveDetails: updateCartDetails,
  clearCart,
};

export default cartService;
