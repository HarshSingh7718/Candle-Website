import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const useWishlist = (product) => {

  const [liked, setLiked] = useState(false);

  useEffect(() => {

    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const exist = wishlist.find((item) => item.id === product.id);

    setLiked(!!exist);
  },[product.id]);
  

  const toggleWishlist = () => {

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const exist = wishlist.find((item) => item.id === product.id);

    if (exist) {

        wishlist = wishlist.filter((item) => item.id !== product.id);

localStorage.setItem("wishlist", JSON.stringify(wishlist));

setLiked(false);

toast.error("Removed from wishlist");
        
    }
    else{
        wishlist.push(product);

localStorage.setItem("wishlist", JSON.stringify(wishlist));

setLiked(true);

toast.success("Added to wishlist");
    }
    window.dispatchEvent(new Event("wishlistupdate"))
}
return {liked,toggleWishlist};

};