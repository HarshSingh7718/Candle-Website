import React, { useRef, useEffect, useState } from 'react';
import PageBanner from '../components/ui/PageBanner';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import toast from "react-hot-toast";
import MainBtn from "../components/ui/Buttons/MainBtn";
import { X } from "lucide-react";
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist'; // Refactored Hook
import { Icon } from "@iconify/react";

gsap.registerPlugin(ScrollTrigger);

const Wishlist = () => {
    const { addToCart } = useCart();
    const { wishlist, removeItem, isLoading } = useWishlist();
    const [selected, setSelected] = useState([]);

    const toggleSelect = (id) => {
        setSelected((prev) => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Bulk Add Logic
    const addSelectedToCart = async () => {
        if (selected.length === 0) {
            toast.error("Please select at least one product");
            return;
        }
        const selectedProducts = wishlist.filter((item) => selected.includes(item._id));
        for (const product of selectedProducts) {
            await addToCart(product);
        }
        toast.success("Selected items added");
    };

    const addAllToCart = async () => {
        for (const product of wishlist) {
            await addToCart(product);
        }
        toast.success("All items added to cart");
    };

    // GSAP ANIMATIONS
    const wishlistRef = useRef();
    useEffect(() => {
        if (!wishlistRef.current || isLoading) return;

        const ctx = gsap.context(() => {
            const q = gsap.utils.selector(wishlistRef);

            gsap.from(q(".wishlist-item"), {
                y: 55,
                opacity: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: q(".wishlist-section"),
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
            });

            gsap.from(q(".wishlist-empty"), {
                scale: 0.9,
                opacity: 0,
                duration: 0.6,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: q(".wishlist-empty"),
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
            });
        }, wishlistRef);
        return () => ctx.revert();
    }, [wishlist, isLoading]);

    if (isLoading) return <div className="py-20 text-center font-serif italic">Loading Wishlist...</div>;

    return (
        <>
            <PageBanner title="wishlist" currentPage="Wishlist" />
            <div ref={wishlistRef} className="container mx-auto py-[8%] px-4">
                {wishlist.length === 0 ? (
                    <p className="text-center text-lg bg-gray-50 shadow-md py-5 wishlist-empty">
                        No products in wishlist
                    </p>
                ) : (
                    <>
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-black text-white wishlist-head">
                                    <tr>
                                        <th className="p-4 wishlist-th"></th>
                                        <th className="p-4 text-left font-medium wishlist-th">Product</th>
                                        <th className="p-4 text-left font-medium wishlist-th">Price</th>
                                        <th className="p-4 text-left font-medium wishlist-th">Stock</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wishlist.map((item) => (
                                        <tr key={item._id} className="border-b border-gray-200 wishlist-item">
                                            <td className="text-center border-r border-gray-200">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.includes(item._id)}
                                                    onChange={() => toggleSelect(item._id)}
                                                    className='cursor-pointer'
                                                />
                                            </td>
                                            <td className="flex items-center px-10 gap-4 py-6 border-r border-gray-200">
                                                <button onClick={() => removeItem(item._id)} className='cursor-pointer'>
                                                    <X size={20} />
                                                </button>
                                                <img src={item.images?.[0]?.url} className="w-20 h-20 object-cover" alt={item.name} />
                                                <p className="font-semibold">{item.name}</p>
                                            </td>
                                            <td className="text-center border-r">
                                                ₹{item.discountPrice > 0 ? item.discountPrice : item.price}
                                            </td>
                                            <td className="text-green-600 text-center border-r border-gray-200">
                                                {item.stock > 0 ? "In Stock" : "Out of Stock"}
                                            </td>
                                            <td className="text-right">
                                                <MainBtn
                                                    type="button"
                                                    onClick={() => addToCart(item)}
                                                    className="bg-transparent! border! shadow-none! rounded-sm! hover:bg-primary!"
                                                    text={"Add to Cart"}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="lg:hidden space-y-6">
                            {wishlist.map((item) => (
                                <div key={item._id} className="border border-gray-200 p-4 rounded-lg wishlist-item">
                                    <div className="flex justify-between">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(item._id)}
                                            onChange={() => toggleSelect(item._id)}
                                        />
                                        <button onClick={() => removeItem(item._id)}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4">
                                        <img src={item.images?.[0]?.url} className="w-20 h-20 rounded-sm object-cover" alt={item.name} />
                                        <p className="font-semibold">{item.name}</p>
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <span>Price</span>
                                        <span>₹{item.price}</span>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span>Status</span>
                                        <span className="text-green-600">{item.stock > 0 ? "In Stock" : "Out of Stock"}</span>
                                    </div>
                                    <div className="mt-4">
                                        <MainBtn 
                                            type="button" 
                                            onClick={() => addToCart(item)} 
                                            className='w-full! bg-transparent! border! border-gray-200! shadow-none! rounded-sm!' 
                                            text={"Add to Cart"} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row justify-end items-center mt-10 gap-4 wishlist-actions">
                            <MainBtn
                                type="button"
                                onClick={addSelectedToCart}
                                className="wishlist-btn w-full! md:w-60! bg-primary! text-white! shadow-none! rounded-sm!"
                                text={"Add Selected to Cart"}
                            />
                            <MainBtn
                                type="button"
                                onClick={addAllToCart}
                                className="wishlist-btn w-full! md:w-50! bg-primary! text-white! shadow-none! rounded-sm!"
                                text={"Add All to Cart"}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Wishlist;