import API from '../api';

const GUEST_CART_KEY = "naisha_guest_cart";

export const getGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
};

export const addToGuestCart = (item) => {
  const cart = getGuestCart();
  const targetId = item.customCandleId || item.productId || item._id;

  const existingIndex = cart.findIndex((i) =>
    i.customCandleId ? i.customCandleId === targetId : (i.productId === targetId || i._id === targetId)
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += (item.quantity || 1);
  } else {
    cart.push({
      _id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: item.productId || (item.customCandleId ? null : item._id || item),
      customCandleId: item.customCandleId || null,
      type: item.customCandleId ? "custom" : "simpleCandle",
      quantity: item.quantity || 1,
      product: item.product || (item.customCandleId ? null : item),
      customCandle: item.customCandle || (item.customCandleId ? item : null),
    });
  }

  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("guest-cart-updated"));
  window.dispatchEvent(new Event("open-cart"));
};

export const updateGuestCartQuantity = (itemId, quantity) => {
  const cart = getGuestCart();
  const index = cart.findIndex((i) => i._id === itemId || i.productId === itemId || i.customCandleId === itemId);

  if (index > -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("guest-cart-updated"));
  }
};

export const removeGuestCartItem = (itemId) => {
  const cart = getGuestCart();
  const filtered = cart.filter((i) => i._id !== itemId && i.productId !== itemId && i.customCandleId !== itemId);
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event("guest-cart-updated"));
};

export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
  window.dispatchEvent(new Event("guest-cart-updated"));
};

export const hasGuestCart = () => getGuestCart().length > 0;

export const mergeGuestCart = async (queryClient) => {
  if (!hasGuestCart()) return false;

  const guestItems = getGuestCart();

  try {
    await Promise.all(
      guestItems.map(async (item) => {
        if (item.type === "custom") {
          const { data } = await API.post("/custom-candle", item.config || item.customCandle);
          return API.post("/cart/addtocart", { customCandleId: data.candle._id, quantity: item.quantity });
        } else {
          return API.post("/cart/addtocart", { productId: item.productId || item._id, quantity: item.quantity });
        }
      })
    );
    clearGuestCart();
    return true;
  } catch (err) {
    console.error("Guest cart merge failed:", err);
    return false;
  }
};
