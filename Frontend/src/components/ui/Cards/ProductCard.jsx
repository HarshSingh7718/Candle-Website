import { Link } from "react-router-dom";
import { useWishlist } from "../../../hooks/useWishlist";
import { useCart } from "../../../hooks/useCart";
import { MoveRight, ShoppingCart, Star } from "lucide-react";
import { Icon } from "@iconify/react";

const ProductCard = ({ product }) => {
  // Logic hooks using backend _id
  // toggleWishlist is a function from our TanStack hook that triggers the mutation
  const { liked, toggleWishlist, isUpdating } = useWishlist(product._id);
  const { addToCart } = useCart();

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountLabel = hasDiscount 
    ? `-${Math.round(((product.price - product.discountPrice) / product.price) * 100)}%`
    : null;

  return (
    <div className="product-item relative product-card">
      <div className="product-image relative rounded-md aspect-square overflow-hidden group">
        
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-20 bg-[#ff5a5f] text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm">
            {discountLabel}
          </div>
        )}

        <Link to={`/collections/candles/product/${product._id}`}>
          <img
            src={product.images?.[0]?.url || "/placeholder.jpg"}
            alt={product.name}
            className="section-image absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />

          <img 
            src={product.images?.[1]?.url || product.images?.[0]?.url} 
            alt={`${product.name} - Alternate View`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
          />
        </Link>

        <ul className="absolute top-[3%] right-[3%] w-fit h-fit gap-2 product-icons z-10 flex justify-center items-center flex-col">
          <li
            onClick={(e) => {
              e.preventDefault(); // Prevents navigation if the click bubbles
              e.stopPropagation(); // Prevents parent elements from seeing the click
              toggleWishlist();
            }}
            className={`cursor-pointer bg-white p-2 rounded-full shadow transition-all active:scale-90 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}
          >
            {liked ? (
              <Icon icon="mdi:heart" className="text-red-500" width="24" />
            ) : (
              <Icon icon="mdi:heart-outline" width="24" />
            )}
          </li>
          
          <li
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            className="cursor-pointer bg-white p-2 rounded-full shadow transition-all active:scale-90"
          >
            <ShoppingCart size={20} />
          </li>

        </ul>
      </div>

      <Link to={`/collections/candles/product/${product._id}`}>
        <div className="product-content px-1 py-2">
          <p className="text-gray-500 text-[13px] mb-1 font-medium tracking-tight uppercase">
            {product.category?.name}
          </p>
          
          <h3 className="text-[#333] font-semibold text-[15px] leading-tight line-clamp-2 h-7 hover:text-[#ff5a5f] transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={13} 
                fill={i < Math.round(product.ratings || 0) ? "#ffb400" : "none"} 
                className={i < Math.round(product.ratings || 0) ? "text-[#ffb400]" : "text-amber-400"}
              />
            ))}
          </div>

          <p className="text-paragraph text-md font-bold">
            {hasDiscount && (
              <span className="line-through text-muted pe-2 font-normal">
                ₹{product.price}
              </span>
            )}
            ₹{hasDiscount ? product.discountPrice : product.price}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;