import React from "react";
import PageBanner from "../components/ui/PageBanner";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import { useCart } from "../hooks/useCart";
import { Minus, Plus } from "lucide-react";
import MainBtn from "../components/ui/Buttons/MainBtn";

gsap.registerPlugin(ScrollTrigger);

function Cart() {
  const { cart, removeFromCart } = useCart();
  const [qty, setQty] = useState({});

  const increase = (id) => {
    setQty((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) < 5 ? (prev[id] || 1) + 1 : 5,
    }));
  };

  const decrease = (id) => {
    setQty((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) > 1 ? prev[id] - 1 : 1,
    }));
  };

  const subtotal = cart.reduce((acc, item) => {
    const quantity = qty[item.id] || 1;
    return acc + item.price * quantity;
  }, 0);

  const cartRef = useRef();
  useEffect(() => {
    if (!cartRef.current) return;
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
  }, [cart]);

  return (
    <>
      <PageBanner title="Cart" currentPage="Cart" />

      <div
        ref={cartRef}
        className="container mx-auto  py-[8%] px-4 
        wishlist-section"
      >
        {cart.length === 0 ? (
          <p
            className="text-center text-lg bg-gray-50 shadow-md py-5
    wishlist-empty"
          >
            Cart is empty
          </p>
        ) : (
          <>
            <div className="hidden lg:block  overscroll-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr className="text-center text-white">
                    <th className="p-4 cart-th"></th>
                    <th
                      className="p-4 text-left font-medium
                cart-th"
                    >
                      Product
                    </th>
                    <th
                      className="p-4   font-medium
                cart-th"
                    >
                      Price
                    </th>
                    <th
                      className="p-4   font-medium
                cart-th"
                    >
                      Quantity
                    </th>
                    <th
                      className="p-4   font-medium
                cart-th"
                    >
                      Status
                    </th>
                    <th
                      className="p-4   font-medium
                cart-th"
                    >
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item) => {
                    const quantity = qty[item.id] || 1;

                    return (
                      <tr key={item.id} className="border-b cart-item">
                        <td className="text-center">
                          <button
                            className="cursor-pointer"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Icon icon="mdi:close" width="18" />
                          </button>
                        </td>

                        <td
                          className="flex items-center gap-4
py-6"
                        >
                          <img
                            src={item.image1}
                            className="w-20 h-20
        object-cover"
                          />
                          <p className="font-semibold">{item.title}</p>
                        </td>

                        <td className="text-center">${item.price}</td>

                        <td className="text-center">
                          <div
                            className="flex
    justify-center items-center
    gap-3"
                          >
                            <button
                              onClick={() => decrease(item.id)}
                              className="border
    border-gray-200 p-2
    cursor-pointer"
                            >
                              <Minus size={14} />
                            </button>

                            <span>{quantity}</span>

                            <button
                              onClick={() => increase(item.id)}
                              className="border
    border-gray-200 p-2
    cursor-pointer"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>

                        <td
                          className="text-green-600
text-center"
                        >
                          In stock
                        </td>

                        <td
                          className="text-center
font-semibold"
                        >
                          ${item.price * quantity}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-6">
              {cart.map((item) => {
                const quantity = qty[item.id] || 1;

                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 bg-white
        shadow-lg p-4 rounded-lg cart-item"
                  >
                    <div className="flex justify-between">
                      <button
                        className="cursor-pointer"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Icon icon="mdi:close" width="18" />
                      </button>
                      <span className="text-green-600">In stock</span>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <img
                        src={item.image1}
                        className="w-20 h-20 object-cover
        rounded-sm"
                      />
                      <p className="font-semibold">{item.title}</p>
                    </div>
                    <div className="flex justify-between mt-4">
                      <span>Price:</span>
                      <span>${item.price}</span>
                    </div>

                    <div className="flex justify-between mt-4">
                      <span>Quantity:</span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrease(item.id)}
                          className="border border-gray-200
p-2 cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span>{quantity}</span>

                        <button
                          onClick={() => increase(item.id)}
                          className="border border-gray-200
p-2 cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div
                      className="flex justify-between mt-4
font-semibold"
                    >
                      <span>Total:</span>
                      <span>${item.price * quantity}</span>
                    </div>
                  </div>
                );
              })}

              
            </div>
            <div className="w-full flex justify-end items-center mt-10">
              <div
                className="w-full lg:w-120 border border-gray-200
    rounded-sm"
              >
                <div
                  className="grid grid-cols-2 border-b
        border-gray-200 cart-item"
                >
                  <div
                    className="p-6 font-semibold bg-gray-50
            border-r border-gray-200"
                  >
                    Subtotal
                  </div>

                  <div className="p-6 text-right font-semibold b">
                    ${subtotal}.00
                  </div>
                </div>
                <div
                  className="grid grid-cols-2 border-b
border-gray-200 cart-item"
                >
                  <div
                    className="p-6 font-semibold bg-gray-50
    border-r border-gray-200"
                  >
                    Shipping
                  </div>

                  <div className="p-6 text-sm text-gray-600">
                    <p className="mb-3">
                      Enter your address to view shipping options.
                    </p>

                    <button
                      className="flex items-center gap-2
font-semibold text-black border-b
border-dashed border-black"
                    >
                      CALCULATE SHIPPING
                      <Icon icon="mdi:truck-delivery-outline" width="18" />
                    </button>
                  </div>
                </div>

                <div
                  className="grid grid-cols-2 border-b
border-gray-200 cart-item"
                >
                  <div
                    className="p-6 font-semibold bg-gray-50
    border-r border-gray-200"
                  >
                    Total
                  </div>
                  <div className="p-6 text-right font-bold text-lg">
                    ${subtotal}.00
                  </div>
                </div>
                <div className="p-6 cart-actions">
                  <MainBtn
                    path="/checkout"
                    text={"PROCEED TO  CHECKOUT"}
                    className="wishlist-btn shadow-none! bg-black!
    text-white! w-full! rounded-sm!"
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
