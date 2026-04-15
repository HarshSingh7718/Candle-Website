import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const useCart = () => {

    const [cart, setCart] = useState([]);
    

    const loadCart = () => {
    const data = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(data);
};


useEffect(() => {
    loadCart();

    window.addEventListener("cartUpdated", loadCart);

return () => {
        window.removeEventListener("cartUpdated", loadCart);
    };
}, []);

const addToCart = (product) => {
    

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

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
const removeFromCart = (id)=>{
let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

cartItems = cartItems.filter((item) => item.id !== id);

localStorage.setItem("cart", JSON.stringify(cartItems));

toast.error("Removed from cart");

window.dispatchEvent(new Event("cartUpdated"));
};
return {cart,addToCart,removeFromCart};
    
}