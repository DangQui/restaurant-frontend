/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { cartService } from "@/services/cartService";
import { useAuthContext } from "@/store/AuthContext";

const CartContext = createContext(null);

const mapServerItem = (item) => ({
  id: item.id,
  menuItemId: item.menuItemId,
  quantity: item.quantity,
  name: item.menuItem?.name || `Món #${item.menuItemId}`,
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    isAuthenticated,
    openAuthModal,
    loading: authLoading,
  } = useAuthContext();
  const authReady = !authLoading;

  const syncItems = useCallback((serverItems = []) => {
    setItems(serverItems.map(mapServerItem));
  }, []);

  const notify = useCallback((variant, title, description) => {
    const message = title || "Thông báo";
    const options = description ? { description } : undefined;
    if (variant === "error") {
      toast.error(message, options);
      return;
    }
    if (variant === "success") {
      toast.success(message, options);
      return;
    }
    toast(message, options);
  }, []);

  const resetState = useCallback(() => {
    setCart(null);
    setItems([]);
    setError(null);
    setLoading(false);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!authReady) {
      return;
    }

    if (!isAuthenticated) {
      resetState();
      return;
    }

    setLoading(true);
    try {
      const activeCart = await cartService.getCart();
      setCart(activeCart);
      syncItems(activeCart?.items || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, [authReady, isAuthenticated, resetState, syncItems]);

  useEffect(() => {
    if (!authReady) return;
    if (isAuthenticated) {
      refreshCart();
    } else {
      resetState();
    }
  }, [authReady, isAuthenticated, refreshCart, resetState]);

  const addItemToCart = useCallback(
    async ({ menuItemId, quantity = 1, price, name, meta }) => {
      if (authLoading) {
        return;
      }
      if (!isAuthenticated) {
        openAuthModal("login");
        notify(
          "error",
          "Yêu cầu đăng nhập",
          "Vui lòng đăng nhập để thêm món vào giỏ hàng"
        );
        return;
      }

      try {
        await cartService.addItem({
          menuItemId,
          quantity,
          price,
          meta: {
            name,
            ...meta,
          },
        });
        await refreshCart();
        notify(
          "success",
          "Đã thêm vào giỏ",
          name ? `Đã thêm ${name} vào giỏ hàng của bạn` : "Món đã được thêm"
        );
      } catch (err) {
        notify(
          "error",
          "Không thể thêm món",
          err.message || "Vui lòng thử lại sau"
        );
      }
    },
    [isAuthenticated, notify, openAuthModal, refreshCart]
  );

  const requireAuth = useCallback(() => {
    if (authLoading) {
      return false;
    }
    if (isAuthenticated) return true;
    openAuthModal("login");
    notify(
      "error",
      "Vui lòng đăng nhập",
      "Tính năng này chỉ dành cho thành viên"
    );
    return false;
  }, [authLoading, isAuthenticated, notify, openAuthModal]);

  const contextValue = useMemo(
    () => ({
      cart,
      cartId: cart?.id,
      items,
      distinctCount: items.length,
      loading,
      error,
      refreshCart,
      syncItems,
      addItemToCart,
      notify,
      requireAuth,
    }),
    [
      addItemToCart,
      cart,
      error,
      items,
      loading,
      notify,
      refreshCart,
      requireAuth,
      syncItems,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext phải được sử dụng trong CartProvider");
  }
  return context;
};
