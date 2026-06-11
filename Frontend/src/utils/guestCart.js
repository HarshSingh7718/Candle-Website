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
    
    if (item.type === "custom") {
        // For custom candles, just push since configs might differ
        cart.push({ ...item, quantity: item.quantity || 1 });
    } else {
        const existing = cart.find(i => 
            i.productId === item.productId || 
            i.customCandleId === item.customCandleId
        );
        if (existing) {
            existing.quantity += item.quantity || 1;
        } else {
            cart.push({ ...item, quantity: item.quantity || 1 });
        }
    }
    
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

export const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
};

export const hasGuestCart = () => getGuestCart().length > 0;

export const mergeGuestCart = async (queryClient) => {
    if (!hasGuestCart()) return false;
    
    const guestItems = getGuestCart();
    
    try {
        await Promise.all(
            guestItems.map(async (item) => {
                if (item.type === "custom") {
                    // Create custom candle first
                    const { data } = await API.post('/custom-candle', item.config);
                    return API.post("/cart/addtocart", { customCandleId: data.candle._id, quantity: item.quantity });
                } else {
                    return API.post("/cart/addtocart", item);
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
