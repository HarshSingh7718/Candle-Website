import React from "react";
import PageBanner from "../components/ui/PageBanner";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import { useCart } from "../hooks/useCart";
import { Minus, Plus } from "lucide-react";
import MainBtn from "../components/ui/Buttons/MainBtn";

gsap.registerPlugin(ScrollTrigger);

function Cart() {
  const { cart, removeFromCart, updateQuantity, isLoading } = useCart();

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

  // Subtotal calculation - Safely handles both simple and custom candles
  const subtotal = cart.reduce((acc, item) => {
    const isCustom = item.type === "custom";
    const productData = isCustom ? item.customCandle : item.product;
    const price = isCustom
      ? productData?.totalPrice
      : (productData?.discountPrice || productData?.price);

    return acc + price * item.quantity;
  }, 0);

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

  if (isLoading) return <div className="py-20 text-center font-serif italic">Loading your cart...</div>;

  return (
    <>
      <PageBanner title="Cart" currentPage="Cart" />

      <div
        ref={cartRef}
        className="container mx-auto py-[4%] px-4 flex flex-col lg:flex-row gap-8 lg:items-start wishlist-section"
      >
        {cart.length === 0 ? (
          <p className="text-center w-full text-lg bg-gray-50 shadow-md py-5 wishlist-empty">
            Cart is empty
          </p>
        ) : (
          <>
            <div className="hidden lg:block overscroll-x-auto w-[180%]">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr className="text-center text-white">
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
                    const isCustom = item.type === "custom";
                    const productData = isCustom ? item.customCandle : item.product;

                    const displayName = isCustom ? "Customized Candle" : productData?.name;
                    const displayPrice = isCustom
                      ? productData?.totalPrice
                      : (productData?.discountPrice || productData?.price || 0);

                    const displayImage = isCustom
                      ? "/placeholder.jpg" // Fallback for custom candles
                      : (productData?.images?.[0]?.url || "/placeholder.jpg");

                    const stockStatus = isCustom
                      ? "Made to Order"
                      : (productData?.stock > 0 ? "In stock" : "Out of stock");

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
                              className="border border-gray-200 p-2 cursor-pointer hover:bg-gray-50"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-4 text-center">{item.quantity}</span>

                            <button
                              onClick={() => increase(item._id, item.quantity)}
                              className="border border-gray-200 p-2 cursor-pointer hover:bg-gray-50"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>

                        <td className={`text-center ${isCustom ? "text-blue-600" : (productData?.stock > 0 ? "text-green-600" : "text-red-600")}`}>
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

                const displayName = isCustom ? "Customized Candle" : productData?.name;
                const displayPrice = isCustom
                  ? productData?.totalPrice
                  : (productData?.discountPrice || productData?.price || 0);

                const displayImage = isCustom
                  ? "/placeholder.jpg"
                  : (productData?.images?.[0]?.url || "/placeholder.jpg");

                const stockStatus = isCustom
                  ? "Made to Order"
                  : (productData?.stock > 0 ? "In stock" : "Out of stock");

                return (
                  <div key={item._id} className="border border-gray-200 bg-white shadow-sm p-4 rounded-lg cart-item">
                    <div className="flex justify-between items-center">
                      <button
                        className="cursor-pointer text-gray-400 hover:text-red-500"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <Icon icon="mdi:close" width="20" />
                      </button>
                      <span className={`text-sm font-medium ${isCustom ? "text-blue-600" : (productData?.stock > 0 ? "text-green-600" : "text-red-600")}`}>
                        {stockStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <img
                        src={displayImage}
                        className="w-20 h-20 object-cover rounded-sm border border-gray-100"
                        alt={displayName}
                      />
                      <p className="font-semibold text-gray-800">{displayName}</p>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-gray-500 text-sm">Price:</span>
                      <span className="font-medium">₹{displayPrice}</span>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-gray-500 text-sm">Quantity:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrease(item._id, item.quantity)}
                          className="border border-gray-200 p-1.5 rounded-sm cursor-pointer active:bg-gray-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-4 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => increase(item._id, item.quantity)}
                          className="border border-gray-200 p-1.5 rounded-sm cursor-pointer active:bg-gray-100"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 font-bold text-lg">
                      <span>Total:</span>
                      <span>₹{displayPrice * item.quantity}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtotal Section */}
            <div className="w-full flex justify-end mb-10 mt-8 lg:mt-0">
              <div className="w-full h-fit lg:w-120 border border-gray-200 lg:sticky lg:top-24 rounded-sm bg-white">
                <div className="grid grid-cols-2 border-b border-gray-200 cart-item">
                  <div className="p-6 font-semibold bg-gray-50 border-r border-gray-200">
                    Subtotal
                  </div>
                  <div className="p-6 text-right font-semibold">
                    ₹{subtotal}.00
                  </div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-200 cart-item">
                  <div className="p-6 font-semibold bg-gray-50 border-r border-gray-200">
                    Shipping
                  </div>
                  <div className="p-6 text-sm text-gray-600">
                    <p className="mb-3">
                      Enter your address to view shipping options.
                    </p>
                    <button className="flex items-center gap-2 font-semibold text-black border-b border-dashed border-black cursor-pointer hover:text-gray-600 transition-colors">
                      CALCULATE SHIPPING
                      <Icon icon="mdi:truck-delivery-outline" width="18" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-gray-200 cart-item">
                  <div className="p-6 font-semibold bg-gray-50 border-r border-gray-200 text-lg">
                    Total
                  </div>
                  <div className="p-6 text-right font-bold text-xl text-[#ea580c]">
                    ₹{subtotal}.00
                  </div>
                </div>
                <div className="p-6 cart-actions">
                  <MainBtn
                    path="/checkout"
                    text={"PROCEED TO CHECKOUT"}
                    className="wishlist-btn shadow-none! bg-black! text-white! w-full! rounded-sm! hover:bg-gray-800!"
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