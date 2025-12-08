const STORAGE_KEY = "wowwraps_mock_cart";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=600&q=80";

const isBrowser = typeof window !== "undefined";
let memoryStore = null;

const baseCart = {
  id: 1,
  status: "active",
  orderType: "delivery",
  customerName: "Khách thử nghiệm",
  customerPhone: "0987654321",
  deliveryAddress: "Số 12 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội",
  deliveryNote: "Vui lòng gọi trước khi giao",
  items: [
    {
      id: 1,
      cartId: 1,
      menuItemId: 101,
      quantity: 1,
      price: 89000,
      menuItem: {
        id: 101,
        name: "Bánh mì truffle kẹp gà",
        description: "Gà nướng than hoa, sốt truffle và rau củ muối chua.",
        category: "lunch",
        imageUrl: FALLBACK_IMAGE,
      },
    },
  ],
};

const getStorage = () => {
  if (isBrowser) {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (error) {
        console.warn("Không thể đọc dữ liệu mock, sử dụng mặc định.", error);
      }
    }
  }
  return memoryStore;
};

const persist = (cart) => {
  if (isBrowser) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } else {
    memoryStore = cart;
  }
};

const ensureCart = () => {
  const current = getStorage();
  if (current) return current;
  persist(baseCart);
  return {
    ...baseCart,
    items: baseCart.items.map((item) => ({
      ...item,
      menuItem: { ...item.menuItem },
    })),
  };
};

const serializeCart = (cart) => ({
  ...cart,
  items: cart.items.map((item) => ({
    ...item,
    menuItem: { ...item.menuItem },
  })),
});

export const mockCartApi = {
  async getCart() {
    const cart = ensureCart();
    persist(cart);
    return serializeCart(cart);
  },

  async addItem(payload) {
    const cart = ensureCart();
    const { menuItemId, quantity = 1, price = 0, meta } = payload;
    const existing = cart.items.find((item) => item.menuItemId === menuItemId);
    if (existing) {
      existing.quantity += quantity;
      existing.price = price || existing.price;
    } else {
      const nextId =
        cart.items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      cart.items.push({
        id: nextId,
        cartId: cart.id,
        menuItemId,
        quantity,
        price,
        menuItem: {
          id: menuItemId,
          name: meta?.name || `Món #${menuItemId}`,
          description: meta?.description || "Món thử nghiệm trong giỏ hàng.",
          category: meta?.category || "menu",
          imageUrl: meta?.imageUrl || FALLBACK_IMAGE,
        },
      });
    }
    persist(cart);
    return serializeCart(cart);
  },

  async updateItem(itemId, quantity) {
    const cart = ensureCart();
    const target = cart.items.find((item) => item.id === Number(itemId));
    if (!target) {
      throw new Error("Không tìm thấy món trong giỏ mock");
    }
    if (quantity < 1) {
      cart.items = cart.items.filter((item) => item.id !== Number(itemId));
    } else {
      target.quantity = quantity;
    }
    persist(cart);
    return serializeCart(cart);
  },

  async removeItem(itemId) {
    const cart = ensureCart();
    cart.items = cart.items.filter((item) => item.id !== Number(itemId));
    persist(cart);
    return serializeCart(cart);
  },

  async updateDetails(payload) {
    const cart = ensureCart();
    Object.assign(cart, payload);
    persist(cart);
    return serializeCart(cart);
  },
};
