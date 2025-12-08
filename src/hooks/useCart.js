import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { cartService } from "@/services/cartService";
import { useAuthContext } from "@/store/AuthContext";
import { useCartContext } from "@/store/CartContext";

const SHIPPING_FEE = 6000;
const DEBOUNCE_DELAY = 3000;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80";

const initialState = {
  cart: null,
  items: [],
  subtotal: 0,
  shippingFee: 0,
  discount: 0,
  total: 0,
  loading: true,
  initialLoading: true,
  error: null,
  couponStatus: "idle",
  couponCode: null,
  addressSaving: false,
  syncingChanges: false,
};

const calculateTotal = (subtotal, discount, shipping) =>
  Math.max(subtotal - discount + shipping, 0);

const formatServerItems = (cart) =>
  (cart?.items || []).map((item) => {
    const unitPrice =
      typeof item.price === "number" ? item.price : item.menuItem?.price || 0;
    return {
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.menuItem?.name || `Món #${item.menuItemId}`,
      description: item.menuItem?.description || "Món ăn trong giỏ hàng",
      category: item.menuItem?.category || cart?.orderType || "menu",
      imageUrl: item.menuItem?.imageUrl || FALLBACK_IMAGE,
      quantity: item.quantity,
      price: unitPrice,
      subtotal: unitPrice * item.quantity,
    };
  });

const withRecalculatedTotals = (state, nextItems) => {
  const subtotal = nextItems.reduce(
    (sum, current) => sum + current.subtotal,
    0
  );
  const shippingFee = nextItems.length ? SHIPPING_FEE : 0;
  const discount = Math.min(state.discount, subtotal);
  return {
    ...state,
    items: nextItems,
    subtotal,
    shippingFee,
    discount,
    total: calculateTotal(subtotal, discount, shippingFee),
    error: null,
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case "REQUEST":
      return { ...state, loading: true, error: null };
    case "SUCCESS": {
      return {
        ...withRecalculatedTotals(
          state,
          formatServerItems(action.payload.cart)
        ),
        cart: action.payload.cart,
        loading: false,
        initialLoading: false,
      };
    }
    case "FAILURE":
      return {
        ...state,
        loading: false,
        initialLoading: false,
        error: action.payload,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "LOCAL_UPDATE_ITEM": {
      const nextItems = state.items.map((item) =>
        item.id === action.payload.itemId
          ? {
              ...item,
              quantity: action.payload.quantity,
              subtotal: item.price * action.payload.quantity,
            }
          : item
      );
      return withRecalculatedTotals(state, nextItems);
    }
    case "LOCAL_REMOVE_ITEM": {
      const nextItems = state.items.filter(
        (item) => item.id !== action.payload.itemId
      );
      return withRecalculatedTotals(state, nextItems);
    }
    case "COUPON_REQUEST":
      return { ...state, couponStatus: "loading" };
    case "COUPON_SUCCESS": {
      const discount = Math.min(action.payload.discount, state.subtotal);
      return {
        ...state,
        couponStatus: "success",
        couponCode: action.payload.code,
        discount,
        total: calculateTotal(state.subtotal, discount, state.shippingFee),
      };
    }
    case "COUPON_FAILURE":
      return { ...state, couponStatus: "error" };
    case "ADDRESS_REQUEST":
      return { ...state, addressSaving: true };
    case "ADDRESS_DONE":
      return { ...state, addressSaving: false };
    case "SYNC_PENDING":
      return { ...state, syncingChanges: true };
    case "SYNC_DONE":
      return { ...state, syncingChanges: false };
    default:
      return state;
  }
};

export const useCart = () => {
  const { loading: authLoading, isAuthenticated } = useAuthContext();
  const { syncItems, notify, requireAuth } = useCartContext();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const pendingActionsRef = useRef({});
  const debounceTimerRef = useRef(null);

  const fetchCart = useCallback(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      dispatch({
        type: "FAILURE",
        payload: "Vui lòng đăng nhập để xem giỏ hàng",
      });
      return;
    }

    dispatch({ type: "REQUEST" });

    cartService
      .getCart()
      .then((cart) => {
        dispatch({
          type: "SUCCESS",
          payload: { cart },
        });
        syncItems(cart?.items || []);
      })
      .catch((error) => {
        dispatch({
          type: "FAILURE",
          payload: error.message || "Không thể tải giỏ hàng",
        });
      });
  }, [authLoading, isAuthenticated, syncItems]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const flushPendingActions = useCallback(async () => {
    const pendingEntries = Object.entries(pendingActionsRef.current);
    pendingActionsRef.current = {};
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!pendingEntries.length) {
      setHasPendingSync(false);
      return;
    }

    if (!requireAuth()) {
      setHasPendingSync(false);
      return;
    }

    setHasPendingSync(false);
    dispatch({ type: "SYNC_PENDING" });

    for (const [itemId, action] of pendingEntries) {
      try {
        if (action.type === "delete") {
          await cartService.removeItem(itemId);
        } else {
          await cartService.updateItem(itemId, action.quantity);
        }
      } catch (error) {
        const message = error.message || "Không thể đồng bộ giỏ hàng";
        dispatch({ type: "SET_ERROR", payload: message });
        notify("error", "Lỗi đồng bộ giỏ hàng", message);
      }
    }

    dispatch({ type: "SYNC_DONE" });
    fetchCart();
  }, [fetchCart, notify, requireAuth]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (Object.keys(pendingActionsRef.current).length) {
        flushPendingActions();
      }
    };
  }, [flushPendingActions]);

  const queueAction = useCallback(
    (itemId, action) => {
      pendingActionsRef.current[itemId] = action;
      setHasPendingSync(true);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        flushPendingActions();
      }, DEBOUNCE_DELAY);
    },
    [flushPendingActions]
  );

  const updateItemQuantity = useCallback(
    (itemId, quantity) => {
      if (!itemId) return;
      if (!requireAuth()) return;

      if (quantity < 1) {
        dispatch({ type: "LOCAL_REMOVE_ITEM", payload: { itemId } });
        queueAction(itemId, { type: "delete" });
      } else {
        dispatch({ type: "LOCAL_UPDATE_ITEM", payload: { itemId, quantity } });
        queueAction(itemId, { type: "update", quantity });
      }
    },
    [queueAction, requireAuth]
  );

  const removeItem = useCallback(
    (itemId) => {
      if (!itemId) return;
      if (!requireAuth()) return;

      dispatch({ type: "LOCAL_REMOVE_ITEM", payload: { itemId } });
      queueAction(itemId, { type: "delete" });
    },
    [queueAction, requireAuth]
  );

  const applyCoupon = useCallback(
    async (code) => {
      if (!requireAuth()) {
        dispatch({ type: "COUPON_FAILURE" });
        return;
      }
      dispatch({ type: "COUPON_REQUEST" });

      await new Promise((resolve) => setTimeout(resolve, 600));

      const normalizedCode = code.trim().toUpperCase();
      if (!normalizedCode) {
        dispatch({ type: "COUPON_FAILURE" });
        notify("error", "Mã giảm giá chưa hợp lệ", "Vui lòng nhập mã giảm giá");
        return;
      }

      try {
        let discount = 0;
        let message = "";

        if (normalizedCode === "WOWWRAPS") {
          discount = Math.round(state.subtotal * 0.1);
          message = "Đã áp dụng giảm 10% cho toàn bộ món ăn";
        } else if (normalizedCode === "FREESHIP") {
          discount = state.shippingFee;
          message = "Miễn phí vận chuyển cho đơn này";
        } else if (normalizedCode === "TASTY50") {
          discount = 50000;
          message = "Giảm ngay 50.000đ";
        } else {
          throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
        }

        dispatch({
          type: "COUPON_SUCCESS",
          payload: {
            code: normalizedCode,
            discount,
            message,
          },
        });
        notify("success", "Đã áp dụng mã", message);
      } catch (error) {
        dispatch({ type: "COUPON_FAILURE" });
        notify("error", "Không áp dụng được mã", error.message);
      }
    },
    [notify, requireAuth, state.shippingFee, state.subtotal]
  );

  const saveDeliveryInfo = useCallback(
    async (payload) => {
      if (!requireAuth()) return;
      dispatch({ type: "ADDRESS_REQUEST" });
      try {
        const updated = await cartService.saveDetails(payload);
        dispatch({
          type: "SUCCESS",
          payload: { cart: updated },
        });
        syncItems(updated?.items || []);
        notify("success", "Đã lưu địa chỉ giao hàng");
      } catch (error) {
        const message = error.message || "Không thể lưu thông tin giao hàng";
        notify("error", "Không thể lưu thông tin", message);
      } finally {
        dispatch({ type: "ADDRESS_DONE" });
      }
    },
    [notify, requireAuth, syncItems]
  );

  return {
    ...state,
    refresh: fetchCart,
    updateItemQuantity,
    removeItem,
    applyCoupon,
    saveDeliveryInfo,
    hasPendingSync,
  };
};
