import React, { useState, useRef } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Star, Heart, Plus } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";

const ProductZoom = ({ product }) => {
  const { addToCart } = useCart();
  
  // ✅ Backend ID mapping for wishlist
  const { liked: isWishlisted, toggleWishlist } = useWishlist(product?._id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  // Custom Cursor States
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isOverInteractive, setIsOverInteractive] = useState(false);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  // ✅ Map Backend Images Array ({url, public_id}) to UI array
  const imageUrls = product?.images?.map(img => img.url) || ["/images/placeholder.jpg"];

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  return (
    <div className="min-h-screen bg-light-yellow flex items-center justify-center p-0 sm:p-4 font-sans text-slate-900 overflow-x-hidden">
      <div className="bg-light-yellow rounded-none sm:rounded-sm w-full relative flex flex-col min-[1281px]:flex-row overflow-hidden min-h-screen sm:min-h-0">
        
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col md:flex-row w-full min-[1281px]:w-[45%] 2xl:w-[44%] p-3 sm:p-4 md:p-8 min-[1281px]:p-6 mx-auto md:max-w-4xl min-[1281px]:max-w-none min-[1281px]:mx-0 self-start sticky top-6">
          <div className="hidden md:flex flex-col gap-2 mr-4 justify-center">
            <button className="flex items-center justify-center p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
              <ChevronUp size={20} />
            </button>
            <div className="flex flex-col gap-2">
              {imageUrls.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-20 border overflow-hidden transition-all flex-shrink-0 cursor-pointer ${activeImageIndex === idx ? "border-black" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <button className="flex items-center justify-center p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
              <ChevronDown size={20} />
            </button>
          </div>

          <div className="flex-1 relative group overflow-hidden bg-white md:cursor-none" ref={containerRef} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => { setIsHovering(false); setIsOverInteractive(false); }} onMouseMove={handleMouseMove}>
            <div className={`absolute pointer-events-none z-50 transition-opacity duration-500 ease-in-out hidden md:block ${isHovering && !isOverInteractive ? "opacity-100" : "opacity-0"}`} style={{ left: mousePos.x, top: mousePos.y, transform: "translate(-50%, -50%)", willChange: "left, top" }}>
              <div className="w-15 h-15 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Plus size={45} strokeWidth={0.5} className="text-black" />
              </div>
            </div>

            <button onClick={(e) => { e.stopPropagation(); toggleWishlist(); }} onMouseEnter={() => setIsOverInteractive(true)} onMouseLeave={() => setIsOverInteractive(false)} className="absolute top-4 right-4 z-[60] bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-md hover:bg-white transition-all group/heart cursor-pointer">
              <Heart size={20} className={`transition-all ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500 group-hover/heart:text-red-500"}`} />
            </button>

            <div className="w-full aspect-[4/4] md:aspect-[4/5] overflow-hidden pointer-events-none select-none">
              <img src={imageUrls[activeImageIndex]} alt="Product Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>

            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:hidden pointer-events-none z-[60]">
              <button onClick={prevImage} onMouseEnter={() => setIsOverInteractive(true)} onMouseLeave={() => setIsOverInteractive(false)} className="bg-white/90 p-1.5 rounded-full shadow-md text-gray-700 pointer-events-auto cursor-pointer"><ChevronLeft size={20} /></button>
              <button onClick={nextImage} onMouseEnter={() => setIsOverInteractive(true)} onMouseLeave={() => setIsOverInteractive(false)} className="bg-white/90 p-1.5 rounded-full shadow-md text-gray-700 pointer-events-auto cursor-pointer"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex-1 p-6 md:p-10 min-[1281px]:p-10 2xl:p-12 bg-light-yellow w-full min-[1281px]:w-[55%] 2xl:w-[56%] md:max-w-4xl mx-auto min-[1281px]:max-w-none min-[1281px]:mx-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight mb-3">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-4 text-sm">
            <div className="flex items-center text-gray-500">
              <span className="mr-1">Collection :</span>
              <span className="text-gray-900 font-medium">{product.category?.name || "Naisha Creations"}</span>
            </div>
            <div className="flex items-center">
              <div className="flex mr-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < product.ratings ? "fill-[#ffb400] text-[#ffb400]" : "text-amber-400"} />
                ))}
              </div>
              <span className="text-gray-400 text-xs">Review ({product.reviews?.length || 0})</span>
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-3 mb-6">
            {product.discountPrice > 0 && <span className="text-xl sm:text-2xl line-through text-gray-400 font-normal">₹{product.price}</span>}
            <span className="text-2xl sm:text-3xl text-gray-900 font-bold">₹{product.discountPrice > 0 ? product.discountPrice : product.price}</span>
            <span className="text-xs sm:text-sm text-gray-500 ml-0 sm:ml-2 w-full sm:w-auto">Availability: <span className="text-emerald-600 font-semibold">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed md:mb-8 border-b border-gray-100 pb-8">{product.description}</p>
          
          <div className="flex flex-col gap-3 mb-10 mt-6">
            <button onClick={() => addToCart(product)} className="w-full h-14 bg-white border border-black hover:bg-black hover:text-white text-black text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-[0.99] shadow-sm cursor-pointer">ADD TO CART</button>
            <button className="w-full h-14 bg-black hover:bg-gray-900 text-white text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-[0.99] shadow-md cursor-pointer">BUY IT NOW</button>
          </div>

          <div className="mt-8 mb-6">
            <p className="text-[#333] text-[13.5px] tracking-widest uppercase mb-6 font-normal">- DELIVERY BETWEEN 5-7 BUSINESS DAYS</p>
            <div className="border-t border-gray-200">
              {[
                { title: "ABOUT Naisha Creations", content: "Premium range of home fragrances designed to elevate your living spaces." },
                { title: "ABOUT FRAGRANCE", content: product.scent || "Formulated with highest quality oils." },
                { title: "SPECIFICATIONS", content: `Burn Time: ${product.burnTime}h | Weight: ${product.weight}g | Material: ${product.material}` }
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-gray-200">
                  <button onClick={() => toggleFaq(idx)} className="w-full flex justify-between items-center py-5 text-left cursor-pointer group">
                    <span className="text-[13px] font-normal text-[#333] tracking-widest uppercase">{faq.title}</span>
                    {openFaq === idx ? <ChevronUp size={18} strokeWidth={1} /> : <ChevronDown size={18} strokeWidth={1} />}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? "max-h-40 opacity-100 pb-5" : "max-h-0 opacity-0"}`}>
                    <p className="text-gray-500 text-[13px] leading-relaxed">{faq.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductZoom;