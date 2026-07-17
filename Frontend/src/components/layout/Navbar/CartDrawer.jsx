import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { useCart } from '../../../hooks/useCart';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, billing, removeFromCart, updateQuantity, isLoading } = useCart();
  const [selectedCustomCandle, setSelectedCustomCandle] = useState(null);

  // Handle escape key to close and body scroll lock (with GSAP pause)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      const smoother = ScrollSmoother.get();
      if (smoother) smoother.paused(true);
    } else {
      document.body.style.overflow = 'unset';
      const smoother = ScrollSmoother.get();
      if (smoother) smoother.paused(false);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Let the 'else' block or the next unmount cycle restore overflow
      if (isOpen) {
        document.body.style.overflow = 'unset';
        const smoother = ScrollSmoother.get();
        if (smoother) smoother.paused(false);
      }
    };
  }, [isOpen, onClose]);

  const handleIncrease = (itemId, currentQty, stock) => {
    // For standard products, cap at stock if available. For custom candles, fallback to 10
    const limit = stock !== undefined && stock > 0 ? stock : 10;
    if (currentQty < limit) updateQuantity(itemId, currentQty + 1);
  };

  const handleDecrease = (itemId, currentQty) => {
    if (currentQty > 1) updateQuantity(itemId, currentQty - 1);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[420px] bg-bg-surface z-[90] transform transition-transform duration-300 ease-out shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="font-serif text-2xl text-primary tracking-widest uppercase">Your Bag</h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-muted/20 bg-light-yellow shadow-sm p-4 rounded-lg animate-pulse">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-4 bg-muted/20 rounded w-16"></div>
                  <div className="h-5 w-5 bg-muted/20 rounded"></div>
                </div>
                <div className="flex gap-4">
                  <div className="w-20 aspect-[4/5] rounded-sm bg-muted/20 shrink-0"></div>
                  <div className="flex flex-col flex-1 justify-between py-1">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted/20 rounded w-3/4"></div>
                      <div className="h-4 bg-muted/20 rounded w-1/2"></div>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <div className="h-4 bg-muted/20 rounded w-16 mb-1"></div>
                      <div className="h-7 bg-muted/20 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingBagIcon />
            <p className="text-secondary mt-4 font-sans text-sm tracking-wide">Your bag is empty.</p>
            <button
              onClick={() => {
                onClose();
                navigate('/collections/candles');
              }}
              className="mt-8 bg-primary text-text-on-brand px-8 py-3 rounded-sm font-bold tracking-widest uppercase hover:bg-slate-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map((item) => {
                const isCustom = item.type === "custom";
                const productData = isCustom ? item.customCandle : item.product;

                const displayName = isCustom ? "Customized Candle" : productData?.name;
                const displayPrice = isCustom
                  ? productData?.totalPrice
                  : productData?.discountPrice || productData?.price || 0;
                const displayImage = isCustom
                  ? productData?.snapshot?.vesselImage || "/placeholder.jpg"
                  : productData?.images?.[0]?.url || "/placeholder.jpg";
                const stockStatus = isCustom
                  ? "Made to Order"
                  : productData?.stock > 0 ? "In stock" : "Out of stock";

                return (
                  <div key={item._id} className="border border-muted/20 bg-light-yellow shadow-sm p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <span className={`text-sm font-medium ${
                        isCustom ? "text-blue-600"
                        : productData?.stock > 0 ? "text-success" : "text-danger"
                      }`}>
                        {stockStatus}
                      </span>
                      <button
                        className="cursor-pointer text-muted hover:text-red-500 transition-colors"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex gap-4">
                      {isCustom ? (
                        <button
                          onClick={() => setSelectedCustomCandle(productData)}
                          className="w-20 aspect-[4/5] overflow-hidden rounded-sm border border-muted/20 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img src={displayImage} className="w-full h-full object-cover" alt={displayName} />
                        </button>
                      ) : (
                        <Link
                          to={`/collections/candles/product/${productData?.slug || productData?._id}`}
                          onClick={onClose}
                          className="w-20 aspect-[4/5] overflow-hidden rounded-sm border border-muted/20 shrink-0 hover:opacity-80 transition-opacity block"
                        >
                          <img src={displayImage} className="w-full h-full object-cover" alt={displayName} />
                        </Link>
                      )}

                      <div className="flex flex-col flex-1 justify-between py-1">
                        {isCustom ? (
                          <button
                            onClick={() => setSelectedCustomCandle(productData)}
                            className="font-semibold text-heading text-left hover:text-coffee transition-colors leading-tight"
                          >
                            {displayName}
                          </button>
                        ) : (
                          <Link
                            to={`/collections/candles/product/${productData?.slug || productData?._id}`}
                            onClick={onClose}
                            className="font-semibold text-heading hover:text-coffee transition-colors leading-tight line-clamp-2"
                          >
                            {displayName}
                          </Link>
                        )}

                        <div className="flex justify-between items-end mt-2">
                          <span className="font-medium">₹{displayPrice}</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDecrease(item._id, item.quantity)}
                              className="border border-muted/20 p-1.5 rounded-sm cursor-pointer hover:bg-coffee/10 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-4 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleIncrease(item._id, item.quantity, productData?.stock)}
                              className="border border-muted/20 p-1.5 rounded-sm cursor-pointer hover:bg-coffee/10 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-surface-2 border-t border-border">
              <div className="flex justify-between items-center mb-3">
                <span className="text-secondary font-sans text-sm tracking-wide uppercase">Subtotal</span>
                <span className="text-primary font-sans text-sm tracking-wide">
                  ₹{billing?.itemsPrice || 0}
                </span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-secondary font-sans text-sm tracking-wide uppercase">Shipping</span>
                <span className={`font-sans text-sm tracking-wide ${billing?.shippingPrice === 0 ? "text-success uppercase" : "text-primary"}`}>
                  {billing?.shippingPrice === 0 ? "Free" : `₹${billing?.shippingPrice || 0}`}
                </span>
              </div>
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
                <span className="text-primary font-serif text-xl tracking-widest uppercase font-bold">Total</span>
                <span className="text-primary font-serif text-xl font-bold text-coffee">
                  ₹{billing?.totalPrice || 0}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
                className="w-full block text-center bg-coffee text-text-on-brand py-4 font-bold tracking-widest uppercase hover:bg-coffee-700 transition-colors cursor-pointer rounded-sm"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Custom Candle Modal */}
      {selectedCustomCandle && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedCustomCandle(null)}
        >
          <div
            className="bg-bg-surface w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCustomCandle(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-danger transition-colors cursor-pointer"
            >
              <Icon icon="mdi:close" width="24" />
            </button>
            <h3 className="text-xl font-bold text-heading mb-6 border-b border-muted/20 pb-4">
              Custom Candle Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-semibold text-text-muted">Vessel:</span>
                <span className="col-span-2 text-heading font-medium">
                  {selectedCustomCandle.snapshot?.vesselName || "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-semibold text-text-muted">Scent:</span>
                <span className="col-span-2 text-heading font-medium">
                  {selectedCustomCandle.snapshot?.scentName || "N/A"}
                </span>
              </div>
              {selectedCustomCandle.snapshot?.addOnNames?.length > 0 && (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-semibold text-text-muted">Add-ons:</span>
                  <span className="col-span-2 text-heading font-medium">
                    {selectedCustomCandle.snapshot.addOnNames.join(", ")}
                  </span>
                </div>
              )}
              {selectedCustomCandle.message && (
                <div className="mt-4 pt-4 border-t border-muted/20 text-sm">
                  <span className="block font-semibold text-text-muted mb-2">Special Instructions:</span>
                  <p className="bg-bg-canvas p-3 rounded-lg text-heading italic">
                    "{selectedCustomCandle.message}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

function ShoppingBagIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-border mb-2 opacity-50" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export default CartDrawer;
