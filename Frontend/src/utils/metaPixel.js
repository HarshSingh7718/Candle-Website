export const fbq = (...args) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq(...args);
    }
};

export const trackPageView = () => fbq('track', 'PageView');

export const trackViewContent = (product) => fbq('track', 'ViewContent', {
    content_ids: [product._id],
    content_name: product.name,
    content_type: 'product',
    value: product.effectivePrice || product.price,
    currency: 'INR'
});

export const trackAddToCart = (product, quantity = 1) => fbq('track', 'AddToCart', {
    content_ids: [product._id],
    content_name: product.name,
    content_type: 'product',
    value: (product.effectivePrice || product.price) * quantity,
    currency: 'INR'
});

export const trackSearch = (keyword) => fbq('track', 'Search', {
    search_string: keyword
});

export const trackInitiateCheckout = (billing) => fbq('track', 'InitiateCheckout', {
    value: billing?.totalPrice || 0,
    currency: 'INR'
});

export const trackPurchase = (order) => fbq('track', 'Purchase', {
    value: order.totalAmount,
    currency: 'INR',
    content_ids: order.orderItems
        .map(i => (i.product?._id || i.product || i.customCandle?._id || i.customCandle))
        .filter(Boolean)
        .map(id => id.toString()),
    content_type: 'product'
});