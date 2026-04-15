import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Heart, 
  Plus 
} from 'lucide-react';

import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

const ProductZoom = ({ product: inputProduct }) => {
  const { addToCart } = useCart();
  const safeProduct = inputProduct || {};
  const { liked: isWishlisted, toggleWishlist } = useWishlist(safeProduct);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  
  // Custom Cursor States
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isOverInteractive, setIsOverInteractive] = useState(false);
  const containerRef = useRef(null);

  // Prevent background scroll when lightbox is open
  useEffect(() => {
    if (isFullScreenOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isFullScreenOpen]);

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Map Input Data to UI Data
  const images = [];
  if (safeProduct.image1) images.push(safeProduct.image1);
  if (safeProduct.hoverImage) images.push(safeProduct.hoverImage);
  if (safeProduct.image3) images.push(safeProduct.image3);
  if (safeProduct.image4) images.push(safeProduct.image4);
  if (safeProduct.image5) images.push(safeProduct.image5);
  if (images.length === 0) images.push('https://via.placeholder.com/600x800?text=No+Image');

  const product = {
    ...safeProduct,
    images: images,
    title: safeProduct.title || "No Title",
    brand: safeProduct.brand || "Brand Name",
    rating: safeProduct.rating || 5,
    reviews: 124, // Placeholders for presentation
    price: typeof safeProduct.price === 'number' ? safeProduct.price : parseFloat(safeProduct.price || 0),
    originalPrice: typeof safeProduct.oldprice === 'number' ? safeProduct.oldprice : (parseFloat(String(safeProduct.oldprice || '0').replace('$', '')) || safeProduct.price || 0),
    stock: 84, // Placeholders for presentation
    description: safeProduct.description || "Indulge in the calming essence of our signature candles.",
  };

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const openLightbox = () => setIsFullScreenOpen(true);
  const closeLightbox = () => setIsFullScreenOpen(false);

  return (
    <div className="min-h-screen bg-light-yellow flex items-center justify-center p-0 sm:p-4 font-sans text-slate-900 overflow-x-hidden">
      
      {/* Lightbox / Full Screen Overlay */}
      {isFullScreenOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center cursor-default"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-3 transition-colors z-[120] cursor-pointer"
            aria-label="Close"
          >
            <X size={32} />
          </button>

          {/* Lightbox Navigation - Left */}
          <button 
            onClick={prevImage}
            className="absolute left-4 sm:left-10 text-white/50 hover:text-white transition-all p-4 z-[120] cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft size={48} />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 pointer-events-none">
            <img 
              src={product.images[activeImageIndex]} 
              alt="Full Size View" 
              className="max-w-full max-h-full object-contain shadow-2xl select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Lightbox Navigation - Right */}
          <button 
            onClick={nextImage}
            className="absolute right-4 sm:right-10 text-white/50 hover:text-white transition-all p-4 z-[120] cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight size={48} />
          </button>

          {/* Image Counter in Lightbox */}
          <div className="absolute bottom-10 text-white/60 font-medium tracking-widest text-sm select-none">
            {activeImageIndex + 1} / {product.images.length}
          </div>
        </div>
      )}

      {/* Modal Container */}
      <div className="bg-light-yellow rounded-none sm:rounded-sm  w-full   relative flex flex-col md:flex-row overflow-hidden min-h-screen sm:min-h-0">
        
        {/* Modal Close Button */}
       

        {/* Left Column: Image Gallery */}
        <div className="flex flex-col md:flex-row w-full md:w-[50%] p-3 sm:p-4 md:p-6 bg-light-yellow">
          {/* Thumbnails Sidebar */}
          <div className="hidden md:flex flex-col gap-2 mr-4">
            <button className="flex items-center justify-center p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
              <ChevronUp size={20} />
            </button>
            <div className="flex flex-col gap-2">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-20 border overflow-hidden transition-all flex-shrink-0 cursor-pointer ${activeImageIndex === idx ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`candle-thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <button className="flex items-center justify-center p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Main Image Container */}
          <div 
            className="flex-1 relative group overflow-hidden bg-light-yellow md:cursor-none"
            ref={containerRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              setIsOverInteractive(false);
            }}
            onMouseMove={handleMouseMove}
            onClick={openLightbox}
          >
            {/* Custom Smooth Cursor Overlay */}
            <div 
              className={`absolute pointer-events-none z-50 transition-opacity duration-300 ease-in-out hidden md:block ${isHovering && !isOverInteractive ? 'opacity-100' : 'opacity-0'}`}
              style={{ 
                left: mousePos.x, 
                top: mousePos.y,
                transform: 'translate(-50%, -50%)',
                willChange: 'left, top'
              }}
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Plus size={20} strokeWidth={1.5} className="text-black" />
              </div>
            </div>

            {/* Wishlist Icon - Higher Z-index to capture clicks */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist();
              }}
              onMouseEnter={() => setIsOverInteractive(true)}
              onMouseLeave={() => setIsOverInteractive(false)}
              className="absolute top-4 right-4 z-[60] bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:bg-white transition-all group/heart cursor-pointer"
            >
              <Heart 
                size={20} 
                className={`transition-all ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500 group-hover/heart:text-red-500'}`} 
              />
            </button>

            {/* Image display */}
            <div className="w-full aspect-[3/4] overflow-hidden pointer-events-none select-none">
              <img 
                src={product.images[activeImageIndex]} 
                alt="Candle Product Main" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Mobile Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:hidden pointer-events-none z-[60]">
              <button 
                onClick={prevImage} 
                onMouseEnter={() => setIsOverInteractive(true)}
                onMouseLeave={() => setIsOverInteractive(false)}
                className="bg-white/90 p-1.5 rounded-full shadow-md text-gray-700 pointer-events-auto cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextImage} 
                onMouseEnter={() => setIsOverInteractive(true)}
                onMouseLeave={() => setIsOverInteractive(false)}
                className="bg-white/90 p-1.5 rounded-full shadow-md text-gray-700 pointer-events-auto cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Horizontal Thumbnails for Mobile */}
          <div className="flex md:hidden gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                className={`w-14 h-16 border flex-shrink-0 overflow-hidden transition-all cursor-pointer ${activeImageIndex === idx ? 'border-black' : 'border-transparent opacity-60'}`}
              >
                <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover pointer-events-none" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Product Details */}
        <div className="flex-1 p-6 md:p-10 bg-light-yellow">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight mb-3">
            {product.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-4 text-sm">
            <div className="flex items-center text-gray-500">
              <span className="mr-1">Collection :</span>
              <span className="text-gray-900 font-medium">{product.brand}</span>
            </div>
            <div className="flex items-center">
              <div className="flex mr-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < product.rating ? "fill-gray-900 text-gray-900" : "text-gray-300"} 
                  />
                ))}
              </div>
              <span className="text-gray-400 text-xs">Review ({product.reviews})</span>
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-3 mb-6">
            <span className="text-xl sm:text-2xl line-through text-gray-400 font-normal">
              ${product.originalPrice.toFixed(2)}
            </span>
            <span className="text-2xl sm:text-3xl text-gray-900 font-bold">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 ml-0 sm:ml-2 w-full sm:w-auto">
              Availability: <span className="text-emerald-600 font-semibold">{product.stock} Units In Stock</span>
            </span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-8 border-b border-gray-100 pb-8">
            {product.description}
          </p>

          <div className="mb-8">
            <span className="inline-flex items-center text-gray-500 text-xs sm:text-sm tracking-wide uppercase font-medium">
              Free Eco-Friendly Shipping on orders over $50
            </span>
          </div>

          {/* New Stacked Button Action Row */}
          <div className="flex flex-col gap-3 mb-10">
            {/* White Add to Cart Button with Black Border - Inverts on hover */}
            <button 
              onClick={() => addToCart(safeProduct)}
              className="w-full h-14 bg-white border border-black hover:bg-black hover:text-white text-black text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-[0.99] shadow-sm cursor-pointer"
            >
              ADD TO CART
            </button>

            {/* Solid Black Buy It Now Button */}
            <button className="w-full h-14 bg-black hover:bg-gray-900 text-white text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-[0.99] shadow-md cursor-pointer">
              BUY IT NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductZoom;