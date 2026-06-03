import React from "react";
import PageBanner from "../components/ui/PageBanner";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import { useCart } from "../hooks/useCart";
import { Minus, Plus } from "lucide-react";
import MainBtn from "../components/ui/Buttons/MainBtn";
import SEO from "../components/SEO";

gsap.registerPlugin(ScrollTrigger);

function Cart() {
  // 👉 1. Destructure the new billing object from useCart
  const { cart, billing, removeFromCart, updateQuantity, isLoading } = useCart();

  const increase = (itemId, currentQty) => {
    if (currentQty < 5) {
      updateQuantity(itemId, currentQty + 1);
    }
  };

  const decrease = (itemId, currentQty) => {
    if (currentQty > 1) {
      updateQuantity(itemId, currentQty - 1);
    }
  };

  // 👉 2. Removed the manual subtotal calculation here!

  const cartRef = useRef();
  useEffect(() => {
    if (!cartRef.current || isLoading) return;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(cartRef);
      gsap.from(q(".cart-item"), {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: q(".cart-section"),
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(q(".cart-empty"), {
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: q(".cart-empty"),
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(q(".cart-actions"), {
        y: 50,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: q(".cart-actions"),
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(q(".cart-btn"), {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.2,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: q(".cart-actions"),
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(q(".cart-head"), {
        y: -40,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: q(".cart-head"),
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(q(".cart-th"), {
        x: -30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: q(".cart-head"),
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    }, cartRef);
    return () => ctx.revert();
  }, [cart, isLoading]);

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
        className="container mx-auto py-[4%] px-4 flex flex-col lg:flex-row gap-8 lg:items-start wishlist-section"
      >
        {cart.length === 0 ? (
          <p className="text-center w-full text-lg bg-light-yellow shadow-md py-5 wishlist-empty">
            Cart is empty
          </p>
        ) : (
          <>
            <div className="hidden lg:block overscroll-x-auto w-[180%]">
              <table className="w-full border-collapse">
                <thead className="bg-primary">
                  <tr className="text-center text-light-yellow">
                    <th className="p-4 cart-th"></th>
                    <th className="p-4 text-left font-medium cart-th">
                      Product
                    </th>
                    <th className="p-4 font-medium cart-th">Price</th>
                    <th className="p-4 font-medium cart-th">Quantity</th>
                    <th className="p-4 font-medium cart-th">Status</th>
                    <th className="p-4 font-medium cart-th">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item) => {
                    const isCustom = item.type === "custom";
                    const productData = isCustom
                      ? item.customCandle
                      : item.product;

                    const displayName = isCustom
                      ? "Customized Candle"
                      : productData?.name;
                    const displayPrice = isCustom
                      ? productData?.totalPrice
                      : productData?.discountPrice || productData?.price || 0;

                    const displayImage = isCustom
                      ? "/placeholder.jpg" // Fallback for custom candles
                      : productData?.images?.[0]?.url || "/placeholder.jpg";

                    const stockStatus = isCustom
                      ? "Made to Order"
                      : productData?.stock > 0
                        ? "In stock"
                        : "Out of stock";

                    return (
                      <tr key={item._id} className="border-b cart-item">
                        <td className="text-center">
                          <button
                            className="cursor-pointer hover:text-red-500 transition-colors"
                            onClick={() => removeFromCart(item._id)}
                          >
                            <Icon icon="mdi:close" width="18" />
                          </button>
                        </td>

                        <td className="flex items-center gap-4 py-6">
                          <img
                            src={displayImage}
                            className="w-20 h-20 object-cover"
                            alt={displayName}
                          />
                          <p className="font-semibold">{displayName}</p>
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

                            <span className="w-4 text-center">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => increase(item._id, item.quantity)}
                              className="border border-muted/20 p-2 cursor-pointer hover:bg-coffee/10"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>

                        <td
                          className={`text-center ${isCustom
                              ? "text-blue-600"
                              : productData?.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                        >
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

            {/* Mobile View */}
            <div className="lg:hidden space-y-6">
              {cart.map((item) => {
                const isCustom = item.type === "custom";
                const productData = isCustom ? item.customCandle : item.product;

                const displayName = isCustom
                  ? "Customized Candle"
                  : productData?.name;
                const displayPrice = isCustom
                  ? productData?.totalPrice
                  : productData?.discountPrice || productData?.price || 0;

                const displayImage = isCustom
                  ? "/placeholder.jpg"
                  : productData?.images?.[0]?.url || "/placeholder.jpg";

                const stockStatus = isCustom
                  ? "Made to Order"
                  : productData?.stock > 0
                    ? "In stock"
                    : "Out of stock";

                return (
                  <div
                    key={item._id}
                    className="border border-muted/20 bg-light-yellow shadow-sm p-4 rounded-lg cart-item"
                  >
                    <div className="flex justify-between items-center">
                      <button
                        className="cursor-pointer text-muted hover:text-red-500"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <Icon icon="mdi:close" width="20" />
                      </button>
                      <span
                        className={`text-sm font-medium ${isCustom
                            ? "text-blue-600"
                            : productData?.stock > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                      >
                        {stockStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <img
                        src={displayImage}
                        className="w-20 h-20 object-cover rounded-sm border border-muted/20"
                        alt={displayName}
                      />
                      <p className="font-semibold text-heading">
                        {displayName}
                      </p>
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
                        <span className="w-4 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increase(item._id, item.quantity)}
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

            {/* 👉 3. Subtotal Section dynamically bound to billing object */}
            <div className="w-full flex justify-end mb-10 mt-8 lg:mt-0">
              <div className="w-full h-fit lg:w-120 border border-muted/20 lg:sticky lg:top-24 rounded-sm bg-light-yellow">

                {/* Subtotal */}
                <div className="grid grid-cols-2 border-b border-muted/20 cart-item">
                  <div className="p-6 font-semibold bg-muted/10 border-r border-muted/20">
                    Subtotal
                  </div>
                  <div className="p-6 text-right font-semibold">
                    ₹{billing?.itemsPrice || 0}.00
                  </div>
                </div>

                {/* Shipping */}
                <div className="grid grid-cols-2 border-b border-muted/20 cart-item">
                  <div className="p-6 font-semibold bg-muted/10 border-r border-muted/20">
                    Shipping
                  </div>
                  <div className={`p-6 text-right font-semibold ${billing?.shippingPrice === 0 ? "text-green-600" : ""}`}>
                    {billing?.shippingPrice === 0 ? "Free" : `₹${billing?.shippingPrice || 0}.00`}
                  </div>
                </div>

                {/* Total */}
                <div className="grid grid-cols-2 border-b border-muted/20 cart-item">
                  <div className="p-6 font-semibold bg-muted/10 border-r border-muted/20 text-lg">
                    Total
                  </div>
                  <div className="p-6 text-right font-bold text-xl text-coffee">
                    ₹{billing?.totalPrice || 0}.00
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="p-6 cart-actions">
                  <MainBtn
                    path="/checkout"
                    text={"PROCEED TO CHECKOUT"}
                    className="wishlist-btn shadow-none! bg-coffee! text-light-yellow! w-full! rounded-sm! hover:bg-coffee-light!"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Cart;