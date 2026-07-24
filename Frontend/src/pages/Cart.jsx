import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import PageBanner from "../components/ui/PageBanner";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import { useCart } from "../hooks/useCart";
import { Minus, Plus, Trash2 } from "lucide-react";
import CouponSection from "../components/ui/CouponSection";
import { useCoupon } from "../hooks/useCoupon";
import SEO from "../components/SEO";

gsap.registerPlugin(ScrollTrigger);

function Cart() {
  const [selectedCustomCandle, setSelectedCustomCandle] = useState(null);

  const { cart, billing, removeFromCart, updateQuantity, isLoading } = useCart();
  const { appliedCoupon, discountAmount } = useCoupon();

  const finalTotal = Math.max(0, (billing?.totalPrice || 0) - discountAmount);

  const increase = (itemId, currentQty, stock) => {
    const limit = stock !== undefined && stock > 0 ? stock : 10;
    if (currentQty < limit) updateQuantity(itemId, currentQty + 1);
  };

  const decrease = (itemId, currentQty) => {
    if (currentQty > 1) updateQuantity(itemId, currentQty - 1);
  };

  const cartRef   = useRef();
  // Track whether the entry animation has already fired
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only run the entry animation once: when the cart first loads with items
    if (!cartRef.current || isLoading || cart.length === 0 || hasAnimated.current) return;

    hasAnimated.current = true;

    const ctx = gsap.context(() => {
      const q  = gsap.utils.selector(cartRef);
      const tl = gsap.timeline();

      tl.from(q(".cart-th"), {
        y: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
      })
      .from(q(".cart-item"), {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
      }, "-=0.3")
      .from(q(".cart-actions"), {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "back.out(1.5)",
      }, "-=0.2");
    }, cartRef);

    return () => ctx.revert();

  // ✅ Only depends on isLoading — NOT on cart, so qty/remove changes
  // never retrigger the animation
  }, [isLoading]);

  // Reset the animation guard if the user empties then re-fills the cart
  useEffect(() => {
    if (cart.length === 0) hasAnimated.current = false;
  }, [cart.length]);

  if (isLoading)
    return (
      <div className="py-20 text-center font-serif italic">
        Loading your cart...
      </div>
    );

  return (
    <>
      <SEO
        title="Cart | Naisha Creations"
        description="Shop our full range of luxury scented candles. Hand-poured with eco-friendly soy wax and premium fragrance oils."
      />
      <PageBanner title="Cart" currentPage="Cart" />

      <div
        ref={cartRef}
        className="container mx-auto py-[4%] px-4 flex flex-col lg:flex-row gap-8 lg:items-start cart-section"
      >
        {cart.length === 0 ? (
          <p className="text-center w-full text-lg bg-light-yellow shadow-md py-5 cart-empty">
            Cart is empty
          </p>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden lg:block overscroll-x-auto w-[180%]">
              <table className="w-full border-collapse">
                <thead className="bg-primary">
                  <tr className="text-center text-light-yellow">
                    <th className="p-4 cart-th"></th>
                    <th className="p-4 text-left font-medium cart-th">Product</th>
                    <th className="p-4 font-medium cart-th">Price</th>
                    <th className="p-4 font-medium cart-th">Quantity</th>
                    <th className="p-4 font-medium cart-th">Status</th>
                    <th className="p-4 font-medium cart-th">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item) => {
                    const isCustom    = item.type === "custom";
                    const productData = isCustom ? item.customCandle : (item.product || item);

                    const displayName  = isCustom ? "Customized Candle" : productData?.name;
                    const displayPrice = isCustom
                      ? productData?.totalPrice
                      : productData?.discountPrice || productData?.price || 0;
                    const displayImage = isCustom
                      ? productData?.snapshot?.vesselImage || "/placeholder.jpg"
                      : productData?.images?.[0]?.url    || "/placeholder.jpg";
                    const isInStock    = isCustom || productData?.stock === undefined || productData?.stock > 0;
                    const stockStatus  = isCustom ? "Made to Order" : (isInStock ? "In stock" : "Out of stock");
                    const stockColor   = isCustom ? "text-blue-600" : (isInStock ? "text-success" : "text-danger");

                    return (
                      <tr key={item._id} className="border-b cart-item">
                        <td className="text-center">
                          <button
                            className="cursor-pointer hover:text-red-500 transition-colors"
                            onClick={() => removeFromCart(item._id)}
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>

                        <td className="py-6">
                          {isCustom ? (
                            <button
                              onClick={() => setSelectedCustomCandle(productData)}
                              className="flex items-center gap-4 text-left hover:opacity-80 transition-opacity cursor-pointer w-full"
                            >
                              <div className="w-16 sm:w-20 aspect-[4/5] overflow-hidden shrink-0">
                                <img src={displayImage} className="w-full h-full object-cover" alt={displayName} />
                              </div>
                              <p className="font-semibold text-heading">{displayName}</p>
                            </button>
                          ) : (
                            <Link
                              to={`/collections/candles/product/${productData?.slug || productData?._id}`}
                              className="flex items-center gap-4 hover:opacity-80 transition-opacity w-full group"
                            >
                              <div className="w-16 sm:w-20 aspect-[4/5] overflow-hidden shrink-0">
                                <img src={displayImage} className="w-full h-full object-cover" alt={displayName} />
                              </div>
                              <p className="font-semibold group-hover:text-coffee transition-colors">{displayName}</p>
                            </Link>
                          )}
                        </td>

                        <td className="text-center">₹{displayPrice}</td>

                        <td className="text-center">
                          <div className="flex justify-center items-center gap-3">
                            <button
                              onClick={() => decrease(item._id, item.quantity)}
                              className="border border-muted/20 p-2 cursor-pointer hover:bg-coffee/10"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => increase(item._id, item.quantity, productData?.stock)}
                              className="border border-muted/20 p-2 cursor-pointer hover:bg-coffee/10"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>

                        <td className={`text-center ${stockColor}`}>
                          {stockStatus}
                        </td>

                        <td className="text-center font-semibold">
                          ₹{displayPrice * item.quantity}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="lg:hidden space-y-6">
              {cart.map((item) => {
                const isCustom    = item.type === "custom";
                const productData = isCustom ? item.customCandle : (item.product || item);

                const displayName  = isCustom ? "Customized Candle" : productData?.name;
                const displayPrice = isCustom
                  ? productData?.totalPrice
                  : productData?.discountPrice || productData?.price || 0;
                const displayImage = isCustom
                  ? productData?.snapshot?.vesselImage || "/placeholder.jpg"
                  : productData?.images?.[0]?.url    || "/placeholder.jpg";
                const isInStock    = isCustom || productData?.stock === undefined || productData?.stock > 0;
                const stockStatus  = isCustom ? "Made to Order" : (isInStock ? "In stock" : "Out of stock");
                const stockColor   = isCustom ? "text-blue-600" : (isInStock ? "text-success" : "text-danger");

                return (
                  <div
                    key={item._id}
                    className="border border-muted/20 bg-light-yellow shadow-sm p-4 rounded-lg cart-item"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${stockColor}`}>
                        {stockStatus}
                      </span>
                      <button
                        className="cursor-pointer text-muted hover:text-red-500"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="mt-4">
                      {isCustom ? (
                        <button
                          onClick={() => setSelectedCustomCandle(productData)}
                          className="flex items-center gap-4 text-left hover:opacity-80 transition-opacity w-full cursor-pointer"
                        >
                          <div className="w-20 aspect-[4/5] overflow-hidden rounded-sm border border-muted/20 shrink-0">
                            <img src={displayImage} className="w-full h-full object-cover" alt={displayName} />
                          </div>
                          <p className="font-semibold text-heading">{displayName}</p>
                        </button>
                      ) : (
                        <Link
                          to={`/collections/candles/product/${productData?.slug || productData?._id}`}
                          className="flex items-center gap-4 hover:opacity-80 transition-opacity w-full group"
                        >
                          <div className="w-20 aspect-[4/5] overflow-hidden rounded-sm border border-muted/20 shrink-0">
                            <img src={displayImage} className="w-full h-full object-cover" alt={displayName} />
                          </div>
                          <p className="font-semibold text-heading group-hover:text-coffee transition-colors">{displayName}</p>
                        </Link>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <span className="text-muted text-sm">Price:</span>
                      <span className="font-medium">₹{displayPrice}</span>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-muted text-sm">Quantity:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrease(item._id, item.quantity)}
                          className="border border-muted/20 p-1.5 rounded-sm cursor-pointer active:bg-coffee/10"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-4 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => increase(item._id, item.quantity, productData?.stock)}
                          className="border border-muted/20 p-1.5 rounded-sm cursor-pointer active:bg-coffee/10"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-muted/20 font-bold text-lg">
                      <span>Total:</span>
                      <span>₹{displayPrice * item.quantity}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Order summary ── */}
            <div className="w-full flex justify-end mb-10 mt-8 lg:mt-0">
              <div className="w-full h-fit lg:w-120 border border-muted/20 lg:sticky lg:top-24 rounded-sm bg-light-yellow p-6 space-y-6">
                <h3 className="font-serif text-lg font-bold text-heading uppercase tracking-wider border-b border-muted/20 pb-3">
                  Order Summary
                </h3>

                {/* Full Coupon Section */}
                <CouponSection variant="full" />

                <div className="border border-muted/20 rounded bg-bg-surface overflow-hidden divide-y divide-muted/20">
                  <div className="flex justify-between items-center p-4 text-sm font-medium">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="text-heading font-semibold">₹{billing?.itemsPrice || 0}.00</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center p-4 text-sm font-medium bg-emerald-50/50 text-emerald-800">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span className="font-bold">-₹{discountAmount}.00</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-4 text-sm font-medium">
                    <span className="text-text-muted">Shipping</span>
                    <span className={`font-semibold ${billing?.shippingPrice === 0 ? "text-success" : "text-heading"}`}>
                      {billing?.shippingPrice === 0 ? "Free" : `₹${billing?.shippingPrice || 0}.00`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 text-base font-bold text-heading bg-bg-canvas/50">
                    <span>Total</span>
                    <span className="text-xl text-primary">₹{finalTotal}.00</span>
                  </div>
                </div>

                <div className="cart-actions pt-2">
                  <Link
                    to="/checkout"
                    className="w-full h-12 bg-primary text-white font-bold tracking-widest uppercase rounded flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    PROCEED TO CHECKOUT
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Custom candle modal ── */}
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
}

export default Cart;