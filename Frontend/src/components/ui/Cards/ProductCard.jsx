import { Link } from "react-router-dom";
import { useWishlist } from "../../../hooks/useWishlist";
import { useCart } from "../../../hooks/useCart";
import { MoveRight, ShoppingCart ,Star} from "lucide-react";
import { Icon } from "@iconify/react";

const ProductCard = ({ product }) => {
  const { liked, toggleWishlist } = useWishlist(product);
  const { addToCart } = useCart();
  return (
    <>
      <div className="product-item relative product-card  ">
        <div className="product-image relative rounded-md aspect-square overflow-hidden group">
             <div className="absolute top-2 left-2 z-20 bg-[#ff5a5f] text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm">
          {product.discount}
        </div>
          <Link to={`/product/${product.id}`}>
            <img
              src={product.image1}
              alt={product.title}
              className="section-image absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
            />

            <img 
          src={product.hoverImage} 
          alt={`${product.title} - Alternate View`}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
        />
          </Link>
          <ul
            className="absolute top-[3%] right-[3%] w-fit h-fit gap-2
product-icons z-10 flex justify-center items-center flex-col"
          >
            <li
              onClick={toggleWishlist}
              className="cursor-pointer bg-white p-2 rounded-full shadow"
            >
              {liked ? (
                <Icon icon="mdi:heart" className="text-red-500" width="24" />
              ) : (
                <Icon icon="mdi:heart-outline" width="24" />
              )}
            </li>
            <li
              onClick={() => addToCart(product)}
              className="cursor-pointer bg-white p-2 rounded-full shadow"
            >
              <ShoppingCart />
            </li>

            <li>
              <Link to={`/product/${product.id}`}>
                <MoveRight />
              </Link>
            </li>
          </ul>
        </div>
        <Link to={`/product/${product.id}`}>
          <div className="product-content px-1 py-2">
             <p className="text-gray-500 text-[13px] mb-1 font-medium tracking-tight uppercase">{product.brand}</p>
           <h3 className="text-[#333] font-semibold text-[15px] leading-tight  line-clamp-2 h-7 hover:text-[#ff5a5f] transition-colors">
          {product.title}
        </h3>

         <div className="flex items-center gap-0.5  mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={13} 
              fill={i < product.rating ? "#ffb400" : "none"} 
              className={i < (product.rating || 0) ? "text-[#ffb400]" : "text-amber-400"}
            />
          ))}
        </div>
            <p className="text-paragraph text-md">
              {product.oldprice && (
                <span className="line-through text-muted pe-2">
                  ${typeof product.oldprice === 'string' ? product.oldprice.replace('$', '') : product.oldprice}
                </span>
              )}
              ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
            </p>
          </div>
        </Link>
        
      </div>
    </>
  );
};

export default ProductCard;
