import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChevronUp,
  ChevronDown,
  Star,
  Heart,
  Plus,
  Minus,
  X
} from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { useNavigate } from "react-router-dom";

/**
 * ProductZoom – Product detail view with image gallery and purchase controls.
 *
 * Props:
 *  - product: the full product object
 *  - onScrollToDescription: callback that scrolls to & opens the Description tab
 */
const ProductZoom = ({ product, onScrollToDescription }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { liked: isWishlisted, toggleWishlist } = useWishlist(product?._id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [qty, setQty] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLightboxOpen]);

  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  const imageUrls =
    product?.images?.map((img) => img.url) || ["/images/placeholder.jpg"];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setActiveImageIndex(
      (prev) => (prev - 1 + imageUrls.length) % imageUrls.length
    );
  };

  // Buy It Now Logic
  const handleBuyNow = async () => {
    await addToCart(product, qty);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-light-yellow flex items-center justify-center p-0 sm:p-4 font-sans text-slate-900 overflow-x-hidden">
      <div className="bg-light-yellow rounded-none sm:rounded-sm w-full relative flex flex-col min-[1281px]:flex-row overflow-hidden min-h-screen sm:min-h-0">
        {/* ─────────────────── Left Column: Image Gallery ─────────────────── */}
        <div className="flex flex-col w-full min-[1281px]:w-[45%] 2xl:w-[44%] p-3 sm:p-4 md:p-8 min-[1281px]:p-6 mx-auto md:max-w-4xl min-[1281px]:max-w-none min-[1281px]:mx-0 self-start sticky top-6">
          {/* Desktop layout: thumbnails on left + main image */}
          <div className="hidden md:flex flex-row">
            {/* Vertical thumbnail strip (desktop only) */}
            <div className="flex flex-col gap-2 mr-4 justify-center">
              {imageUrls.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-20 border overflow-hidden transition-all flex-shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-coffee"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`thumb-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main image (desktop) */}
            <div 
              className="flex-1 relative group overflow-hidden bg-light-yellow cursor-zoom-in"
              onClick={() => setIsLightboxOpen(true)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist();
                }}
                className="absolute top-4 right-4 z-[40] bg-light-yellow/90 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:bg-light-yellow transition-all group/heart cursor-pointer"
              >
                <Heart
                  size={20}
                  className={`transition-all ${
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-muted hover:text-red-500"
                  }`}
                />
              </button>

              <div className="w-full aspect-[4/5] overflow-hidden">
                <img
                  src={imageUrls[activeImageIndex]}
                  alt="Product Main"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Mobile layout: main image + horizontal thumbnails below */}
          <div className="flex flex-col md:hidden">
            {/* Main image (no zoom on mobile — tap to see lightbox) */}
            <div 
              className="relative group overflow-hidden bg-light-yellow cursor-zoom-in"
              onClick={() => setIsLightboxOpen(true)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist();
                }}
                className="absolute top-4 right-4 z-[40] bg-light-yellow/90 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:bg-light-yellow transition-all cursor-pointer"
              >
                <Heart
                  size={20}
                  className={`transition-all ${
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-muted hover:text-red-500"
                  }`}
                />
              </button>

              <div className="w-full aspect-square overflow-hidden">
                <img
                  src={imageUrls[activeImageIndex]}
                  alt="Product Main"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Horizontal thumbnail strip (mobile) */}
            {imageUrls.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar pb-1">
                {imageUrls.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 border overflow-hidden transition-all flex-shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-coffee"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────── Right Column: Details ─────────────────── */}
        <div className="flex-1 p-6 md:p-10 min-[1281px]:p-10 2xl:p-12 bg-light-yellow w-full min-[1281px]:w-[55%] 2xl:w-[56%] md:max-w-4xl mx-auto min-[1281px]:max-w-none min-[1281px]:mx-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-heading leading-tight mb-3">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-4 text-sm">
            <div className="flex items-center text-muted">
              <span className="mr-1">Collection :</span>
              <span className="text-heading font-medium">
                {product.category?.map(c => c.name).join(', ') || "Naisha Creations"}
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex mr-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < product.ratings
                        ? "fill-[#ffb400] text-[#ffb400]"
                        : "text-orange-400"
                    }
                  />
                ))}
              </div>
              <span className="text-muted text-xs">
                Review ({product.numOfReviews || 0})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-3 mb-6">
            {product.discountPrice > 0 && (
              <span className="text-xl sm:text-2xl line-through text-muted font-normal">
                ₹{product.price}
              </span>
            )}
            <span className="text-2xl sm:text-3xl text-heading font-bold">
              ₹{product.discountPrice > 0 ? product.discountPrice : product.price}
            </span>
            <span className="text-xs sm:text-sm text-paragraph ml-0 sm:ml-2 w-full sm:w-auto">
              Availability:{" "}
              <span className="text-emerald-600 font-semibold">
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </span>
          </div>

          {/* Short description — clicking scrolls to the full Description tab */}
          <button
            onClick={onScrollToDescription}
            className="text-left w-full text-paragraph text-sm leading-relaxed border-b border-muted/20 pb-8 cursor-pointer hover:text-heading transition-colors group/desc"
          >
            <span className="line-clamp-3">{product.description}</span>
            <span className="text-xs text-coffee font-medium mt-1 inline-block group-hover/desc:underline">
              Read full description ↓
            </span>
          </button>

          {/* Quantity and Actions */}
          <div className="flex flex-col gap-4 mb-10 mt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-coffee h-14 bg-light-yellow">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 h-full hover:bg-coffee/10 cursor-pointer transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold text-lg text-heading">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-4 h-full hover:bg-coffee/10 cursor-pointer transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={() => addToCart(product, qty)}
                className="flex-1 h-14 bg-light-yellow border border-coffee hover:bg-coffee hover:text-light-yellow text-heading text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                ADD TO CART
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full h-14 bg-coffee hover:bg-coffee-light text-light-yellow text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-[0.98] shadow-md cursor-pointer"
            >
              BUY IT NOW
            </button>
          </div>

          {/* Delivery & FAQ Info */}
          <div className="mt-8 mb-6">
            <div className="border-t border-muted/20">
              {[
                {
                  title: "ABOUT Naisha Creations",
                  content:
                    "Premium range of home fragrances designed to elevate your living spaces.",
                },
                {
                  title: "ABOUT FRAGRANCE",
                  content:
                    product.scent || "Formulated with highest quality oils.",
                },
                {
                  title: "SPECIFICATIONS",
                  content: `Burn Time: ${product.burnTime}h | Weight: ${product.weight}g | Material: ${product.material}${product.vessel ? ` | Vessel: ${product.vessel}` : ''}`,
                },
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-muted/20">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center py-5 text-left cursor-pointer group"
                  >
                    <span className="text-[13px] font-normal text-heading tracking-widest uppercase">
                      {faq.title}
                    </span>
                    {openFaq === idx ? (
                      <ChevronUp size={18} strokeWidth={1} />
                    ) : (
                      <ChevronDown size={18} strokeWidth={1} />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === idx
                        ? "max-h-40 opacity-100 pb-5"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-paragraph text-[13px] leading-relaxed">
                      {faq.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────── Lightbox Modal ─────────────────── */}
      {isLightboxOpen && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-8 w-screen h-[100dvh] overflow-hidden"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-gray-300 p-2 cursor-pointer z-[60] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
          >
            <X size={32} />
          </button>
          
          {/* Large Image Container */}
          <div className="flex-1 w-full min-h-0 flex items-center justify-center mb-4 sm:mb-6">
            <img 
              src={imageUrls[activeImageIndex]} 
              alt="Lightbox Main" 
              className="max-w-full max-h-full object-contain select-none drop-shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
          
          {/* Thumbnail Strip */}
          {imageUrls.length > 1 && (
            <div 
              className="flex gap-4 overflow-x-auto max-w-full pb-2 hide-scrollbar shrink-0 px-2 sm:px-4" 
              onClick={(e) => e.stopPropagation()}
            >
              {imageUrls.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`w-16 h-20 sm:w-20 sm:h-24 border-2 overflow-hidden transition-all flex-shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-white scale-105"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`lightbox-thumb-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>, 
        document.body)}
    </div>
  );
};

export default ProductZoom;