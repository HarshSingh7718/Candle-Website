import React, { memo } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../../hooks/useWishlist";
import { useCart } from "../../../hooks/useCart";
import { ShoppingCart, Star } from "lucide-react";
import { Icon } from "@iconify/react";
import { optimizeCloudinaryUrl } from "../../../utils/imageOptimizer";

const ProductCard = memo(({ product }) => {
  const { liked, toggleWishlist, isUpdating } = useWishlist(product._id);
  const { addToCart } = useCart();

  const hasDiscount =
    product.discountPrice > 0 && product.discountPrice < product.price;
  const discountLabel = hasDiscount
    ? `-${Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )}%`
    : null;

  return (
    <div className="product-item relative product-card group">
      <div className="product-image relative rounded-md aspect-square overflow-hidden">
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-20 bg-[#ff5a5f] text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm">
            {discountLabel}
          </div>
        )}

        <Link to={`/collections/candles/product/${product.slug || product._id}`}>
          <img
            src={optimizeCloudinaryUrl(product.images?.[0]?.url) || "/placeholder.jpg"}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
            loading="lazy"
          />

          <img
            src={optimizeCloudinaryUrl(product.images?.[1]?.url || product.images?.[0]?.url)}
            alt={`${product.name} alternate`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Action Icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist();
            }}
            disabled={isUpdating}
            className="bg-white p-2 rounded-full  shadow hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {liked ? (
              <Icon icon="mdi:heart" className="text-red-500" width="24" />
            ) : (
              <Icon icon="mdi:heart-outline" width="24" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product); // Defaults to qty 1 in our hook
            }}
            className="bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ShoppingCart size={24} />
          </button>
        </div>
      </div>

      <Link to={`/collections/candles/product/${product.slug || product._id}`}>
        <div className="product-content py-3">
          <p className="text-gray-500 text-[13px] mb-1 font-medium tracking-widest uppercase">
            {product.category?.name || "Premium Candle"}
          </p>

          <h3 className="text-[#333] font-semibold text-[15px] leading-tight line-clamp-2  h-7 group-hover:text-[#ff5a5f] transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                fill={i < Math.round(product.ratings || 0) ? "#ffb400" : "none"}
                className={
                  i < Math.round(product.ratings || 0)
                    ? "text-[#ffb400]"
                    : "text-gray-200"
                }
              />
            ))}
          </div>

          <p className="text-sm font-bold flex items-center gap-2">
            {hasDiscount && (
              <span className="line-through text-gray-400 font-normal">
                ₹{product.price}
              </span>
            )}
            <span className="text-black">
              ₹{hasDiscount ? product.discountPrice : product.price}
            </span>
          </p>
        </div>
      </Link>
    </div>
  );
});

export default ProductCard;
