import React from 'react'
import PageBanner from '../components/ui/PageBanner'
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import toast from "react-hot-toast";
import MainBtn from "../components/ui/Buttons/MainBtn";
import { X } from "lucide-react";
import { useCart } from '../hooks/useCart';

gsap.registerPlugin(ScrollTrigger);

const Wishlist = () => {
    const {cart} = useCart();
    const [wishlist, setWishlist] = useState([]);
const [selected, setSelected] = useState([]);

const loadWishlist = () => {

  const wishlistData = JSON.parse(localStorage.getItem("wishlist")) || [];
  const cartData = JSON.parse(localStorage.getItem("cart")) || [];
  setWishlist(wishlistData);

const preSelected = wishlistData
  .filter((item) => cartData.some((cartItem) => cartItem.id === item.id))
  .map((item) => item.id);

setSelected(preSelected);
};
useEffect(() => {
  loadWishlist();

  window.addEventListener("wishlistUpdated", loadWishlist);

  return () => {
    window.removeEventListener("wishlistUpdated", loadWishlist);
  };
}, []);

const removeProduct = (id) => {

  const updated = wishlist.filter((item) => item.id !== id);

  localStorage.setItem("wishlist", JSON.stringify(updated));

  setWishlist(updated);

  setSelected((prev) => prev.filter((item) => item !== id));

  toast.error("Removed from wishlist");

window.dispatchEvent(new Event("wishlistUpdated"));
};
const toggleSelect = (id) => {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (selected.includes(id)) {

    const updatedSelected = selected.filter((item) => item !== id);
    setSelected(updatedSelected);

    cart = cart.filter((item) => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));

    toast("Removed from cart");

    window.dispatchEvent(new Event("cartUpdated"));
  } else {

    setSelected([...selected, id]);
  }
};

const addToCart = (product) => {

  const exist = cart.find((item) => item.id === product.id);

  if (exist) {
    toast("Product already in cart");
    return;
  }
  cart.push(product);

localStorage.setItem("cart", JSON.stringify(cart));

toast.success("Added to cart");

window.dispatchEvent(new Event("cartUpdated"));
};

const addSelectedToCart = () => {

  if (selected.length === 0) {
    toast.error("Please select at least one product");
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const selectedProducts = wishlist.filter((item) =>
  selected.includes(item.id)
);

let addedCount = 0;

selectedProducts.forEach((product) => {
const exist = cart.find((item) => item.id === product.id);

  if (!exist) {
    cart.push(product);
    addedCount++;
  }
});
if (addedCount === 0) {
  toast("Selected products already in cart");
  return;
}
localStorage.setItem("cart", JSON.stringify(cart));

toast.success(`${addedCount} product added`);

window.dispatchEvent(new Event("cartUpdated"))

};

const addAllToCart = () => {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    wishlist.forEach((product) => {

        const exist = cart.find((item) => item.id === product.id);

        if (!exist) {
    cart.push(product);
}
    });
    localStorage.setItem("cart", JSON.stringify(cart));

toast.success("All items added to cart");

window.dispatchEvent(new Event("cartUpdated"));
};

const wishlistRef = useRef();
useEffect(() => {
    if (!wishlistRef.current) return;

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
gsap.from(q(".wishlist-actions"), {
    y: 50,
    opacity: 0,
    duration: 0.6,
    ease: "power3.out",
    scrollTrigger: {
        trigger: q(".wishlist-actions"),
        start: "top 90%",
toggleActions: "play none none reverse",
    },
});
gsap.from(q(".wishlist-btn"), {
    y: 30,
    opacity: 0,
    duration: 0.5,
    stagger: 0.2,
    delay: 0.2,
    ease: "power3.out",
    scrollTrigger: {
    trigger: q(".wishlist-actions"),
    start: "top 90%",
    toggleActions: "play none none reverse",
},
});

gsap.from(q(".wishlist-head"), {
    y: -40,
    opacity: 0,
    duration: 0.5,
    ease: "power3.out",
    scrollTrigger: {
        trigger: q(".wishlist-head"),
         start: "top 90%",
    toggleActions: "play none none reverse",

    },
});

gsap.from(q(".wishlist-th"), {
    x: -30,
    opacity: 0,
    duration: 0.4,
    stagger: 0.15,
    ease: "power3.out",
    scrollTrigger: {
        trigger: q(".wishlist-head"),
         start: "top 90%",
    toggleActions: "play none none reverse",


    },

});
    },wishlistRef);
    return ()=> ctx.revert();
},[wishlist]);
  return (
    <>
    <PageBanner title="wishlist" currentPage="Wishlist" />
    <div ref={wishlistRef} className="container mx-auto py-[8%] px-4    
">
    {wishlist.length === 0 ? (
        <p className="text-center text-lg bg-gray-50 shadow-md py-5
        wishlist-empty">
            No products in wishlist
        </p>
    ) : (
        <>
        <div className="hidden lg:block overflow-x-auto">

    <table className="w-full">

        <thead className="bg-black text-white wishlist-head">
            <tr>
                <th className="p-4 wishlist-th"></th>
                <th className="p-4 text-left font-medium
wishlist-th">Product</th>
<th className="p-4 text-left font-medium
wishlist-th">Price</th>
<th className="p-4 text-left font-medium
wishlist-th">Stock</th>
<th className="p-4"></th>

            </tr>
        </thead>
        <tbody>
    {wishlist.map((item) => (
        <tr key={item.id} className="border-b
        border-gray-200 wishlist-item">
            <td className="text-center border-r
border-gray-200">
    <input
        type="checkbox"
        checked={selected.includes(item.
        id)}
        onChange={() => toggleSelect(item.
        id)}
        className='cursor-pointer'
    />
</td>
         <td className="flex items-center px-10
gap-4 py-6 border-r border-gray-200">

    <button
        onClick={() => removeProduct(item.
        id)}
        className='cursor-pointer'

    >
     <X size={20} />
    </button>
    <img
    src={item.image1}
    className="w-20 h-20 object-cover"
/>

<p className="font-semibold">
    {item.title}
</p>



</td>

<td className="text-center border-r
bg-gray-200">
  ${item.price}.00
</td>

<td className="text-green-600 text-center
border-r border-gray-200">In stock</td>

<td className="text-right">
    <MainBtn
        type="button"
        onClick={() => addToCart(item)}
        className="bg-transparent! border!
        shadow-none! rounded-sm! hover:bg-primary!"
        text={"Add to Cart"}
    />
</td>
        </tr>
    ))}
</tbody>

    </table>
</div>
<div className="lg:hidden space-y-6">

    {wishlist.map((item) => (

        <div key={item.id} className="border border-gray-200
        p-4 rounded-lg wishlist-item">

            <div className="flex justify-between">

    <input
        type="checkbox"
        checked={selected.includes(item.id)}
        onChange={() => toggleSelect(item.id)}
    />
    <button
    onClick={() => removeProduct(item.id)}
>
    <X size={20} />
</button>

</div>
<div className="flex items-center gap-4 mt-4">

    <img
        src={item.image1}
        className="w-20 h-20 rounded-sm
        object-cover"
    />
    <p className="font-semibold">
    {item.title}
</p>

</div>

<div className="flex justify-between mt-4">
    <span>Price</span>
    <span>${item.price}.00</span>
</div>

<div className="flex justify-between mt-2">
    <span>Status</span>
    <span className="text-green-600">In stock</span>
</div>

<div className="mt-4">
    <MainBtn type="button"
    onClick={()=>addToCart(item)}
    className='w-full! bg-transparent! border! border-gray-200! shadow-none!  rounded-sm!'
    text={"Add to Cart"} />
</div>
        </div>

    ))}

</div>

<div className="flex flex-col md:flex-row justify-end 
items-center mt-10 gap-4 wishlist-actions">

    <MainBtn
        type="button"
        onClick={addSelectedToCart}
        className="wishlist-btn w-full! md:w-60! bg-primary! 
        text-white! shadow-none! rounded-sm!"
        text={"Add Selected to Cart"}
    />
    <MainBtn
    type="button"
    onClick={addAllToCart}
    className="wishlist-btn w-full! md:w-50! bg-primary! 
    text-white! shadow-none! rounded-sm!"
    text={"Add All to Cart"}
/>

</div>
        </>
    )}
</div>
    </>
  )
}

export default Wishlist
