import React, { useState, useEffect, useRef } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { createPortal } from "react-dom";
import {
  ChevronUp,
  ChevronDown,
  Heart,
  Plus,
  Minus,
  X,
  Flame,
  Package,
  Droplets,
  ArrowRight,
} from "lucide-react";
import { trackAddToCart } from "../../utils/metaPixel";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { useNavigate } from "react-router-dom";
import StarRating from "../ui/StarRating";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Spec Card ───────────────────────────────────────────────────────── */
function SpecCard({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="bg-bg-canvas border border-bg-muted/60 rounded-md p-3 flex items-start gap-2.5">
      <span className="text-coffee flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <div className="text-[10px] font-semibold tracking-wider uppercase text-text-muted mb-0.5">
          {label}
        </div>
        <div className="text-sm font-medium text-heading">{value}</div>
      </div>
    </div>
  );
}

/* ─── Accordion Item ──────────────────────────────────────────────────── */
function AccordionItem({ title, content, open, onToggle }) {
  return (
    <div className="border-b border-bg-muted/60">
      <button
        type="button"
        className="w-full flex justify-between items-center py-4 bg-transparent border-none cursor-pointer text-xs font-bold tracking-widest uppercase text-heading hover:text-coffee transition-colors"
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
      >
        <span>{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-text-muted" />
        ) : (
          <ChevronDown size={16} className="text-text-muted" />
        )}
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0 pb-0"
        }`}
      >
        <div className="overflow-hidden text-paragraph text-sm leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */
const ProductZoom = ({ product, onScrollToDescription }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { liked: isWishlisted, toggleWishlist } = useWishlist(product?._id);

  const [activeIdx, setActiveIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [qty, setQty] = useState(1);
  const [lightbox, setLightbox] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  const galleryRef = useRef(null);
  const detailsRef = useRef(null);
  const closeBtnRef = useRef(null);

  const imageUrls = product?.images?.length
    ? product.images.map((i) => i.url)
    : ["/images/placeholder.jpg"];
  const inStock = product?.stock > 0;
  const price = product?.discountPrice > 0 ? product.discountPrice : product?.price;
  const original = product?.discountPrice > 0 ? product?.price : null;
  const discount = original ? Math.round(((original - price) / original) * 100) : null;
  const maxStock = product?.stock !== undefined ? product.stock : 99;

  // ── GSAP Sticky Pinning on Desktop ──
  useEffect(() => {
    if (!galleryRef.current || !detailsRef.current) return;
    let ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          trigger: galleryRef.current,
          endTrigger: detailsRef.current,
          start: "top 112px",
          end: () => {
            const detailsH = detailsRef.current?.offsetHeight || 0;
            const galleryH = galleryRef.current?.offsetHeight || 0;
            return `+=${Math.max(0, detailsH - galleryH)}`;
          },
          pin: true,
          invalidateOnRefresh: true,
        });
      });
    });
    return () => ctx.revert();
  }, []);

  // Reset active image index & loading state on product change
  useEffect(() => {
    setActiveIdx(0);
    setIsImgLoaded(false);
  }, [product?._id]);

  // Lock body scroll & focus close button when lightbox opens
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = "hidden";
      const smoother = ScrollSmoother.get();
      if (smoother) smoother.paused(true);
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      const smoother = ScrollSmoother.get();
      if (smoother) smoother.paused(false);
    }
    return () => {
      document.body.style.overflow = "";
      const smoother = ScrollSmoother.get();
      if (smoother) smoother.paused(false);
    };
  }, [lightbox]);

  // ── Lightbox Keyboard Controls ──
  useEffect(() => {
    if (!lightbox) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightbox(false);
      } else if (e.key === "ArrowLeft") {
        setActiveIdx((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
      } else if (e.key === "ArrowRight") {
        setActiveIdx((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox, imageUrls.length]);

  const handleBuyNow = async () => {
    if (!inStock) return;
    await addToCart(product, qty);
    await trackAddToCart(product, qty);
    navigate("/checkout");
  };

  const faqs = [
    {
      title: "About Naisha Creations",
      content:
        "We are a Dehradun-based handmade candle studio crafting premium, smokeless soy wax candles designed to elevate your living space. Every piece is poured by hand with love.",
    },
    {
      title: "Fragrance Notes",
      content:
        product?.scent ||
        "Formulated with the highest quality fragrance oils. Each scent is carefully chosen for clarity, longevity, and mood.",
    },
    {
      title: "Delivery & Packaging",
      content:
        "Ships within 48 hours. Packed in eco-friendly tissue wrap and a gift-ready box. Available for gifting with a personal note — DM us to arrange.",
    },
  ];

  /* ── Lightbox Portal ─────────────────────────────────────── */
  const Lightbox = () =>
    createPortal(
      <div
        className="fixed inset-0 z-[9999] bg-heading/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
        onClick={() => setLightbox(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Image gallery lightbox"
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="absolute top-5 right-5 text-white/80 hover:text-white transition-opacity cursor-pointer p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
          onClick={(e) => {
            e.stopPropagation();
            setLightbox(false);
          }}
          aria-label="Close lightbox"
        >
          <X size={28} />
        </button>

        <img
          src={imageUrls[activeIdx]}
          alt={product?.name || "Product image"}
          className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-sm"
          onClick={(e) => e.stopPropagation()}
        />

        {imageUrls.length > 1 && (
          <div
            className="flex gap-2.5 mt-6 overflow-x-auto hide-scrollbar max-w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {imageUrls.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(idx);
                }}
                className={`w-14 aspect-[4/5] flex-shrink-0 border-2 rounded overflow-hidden cursor-pointer transition-all ${
                  activeIdx === idx
                    ? "border-white opacity-100 scale-105"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>,
      document.body
    );

  /* ── Main Render ─────────────────────────────────────────── */
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[48%_52%] gap-8 lg:gap-12 items-start">

        {/* ── Left Column: Gallery ── */}
        <div ref={galleryRef} className="w-full flex flex-col lg:flex-row gap-3 items-start">
          {/* Thumbnails (Vertical rail on desktop left, horizontal scroll on mobile bottom) */}
          {imageUrls.length > 1 && (
            <div className="flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto hide-scrollbar py-1 lg:py-0 w-full lg:w-20 lg:max-h-[520px] flex-shrink-0 order-2 lg:order-1">
              {imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveIdx(idx);
                    setIsImgLoaded(false);
                  }}
                  className={`w-16 lg:w-full aspect-[4/5] flex-shrink-0 border-2 rounded overflow-hidden cursor-pointer transition-all ${
                    activeIdx === idx
                      ? "border-primary opacity-100"
                      : "border-transparent opacity-60 hover:opacity-90"
                  }`}
                  aria-label={`Select product thumbnail ${idx + 1}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div
            className="relative aspect-[4/5] w-full flex-1 overflow-hidden rounded-md bg-bg-canvas group cursor-zoom-in border border-bg-muted/40 order-1 lg:order-2"
            onClick={() => setLightbox(true)}
          >
            {/* Loading Placeholder Skeleton */}
            {!isImgLoaded && (
              <div className="absolute inset-0 bg-bg-muted/40 animate-pulse" />
            )}

            <img
              src={imageUrls[activeIdx]}
              alt={product?.name || "Product"}
              onLoad={() => setIsImgLoaded(true)}
              className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                isImgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Wishlist Button */}
            <button
              type="button"
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-bg-canvas/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist();
              }}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={18}
                className={`transition-colors ${
                  isWishlisted
                    ? "fill-danger text-danger"
                    : "text-text-muted hover:text-danger"
                }`}
              />
            </button>

            {/* Discount Badge */}
            {discount && (
              <div className="absolute top-4 left-4 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-sm tracking-wider">
                -{discount}%
              </div>
            )}

            {/* Zoom Hint */}
            <div className="absolute bottom-4 right-4 bg-bg-canvas/90 backdrop-blur-md text-primary text-[10px] font-semibold tracking-wider px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
              CLICK TO ZOOM
            </div>
          </div>
        </div>

        {/* ── Right Column: Details ── */}
        <div ref={detailsRef} className="bg-bg-surface rounded-md p-6 sm:p-8 lg:p-10 border border-bg-muted/40 shadow-sm flex flex-col">
          {/* Eyebrow / Category */}
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-coffee mb-3">
            {product?.category?.map((c) => c.name).join(" · ") || "Naisha Creations"}
          </div>

          {/* Product Title */}
          <h1 className="text-2xl sm:text-3xl font-medium text-heading leading-snug mb-4">
            {product?.name}
          </h1>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-2 mb-5">
            <StarRating rating={product?.ratings || 0} size={15} />
            <span className="text-xs text-text-muted font-medium">
              ({product?.numOfReviews || 0} reviews)
            </span>
          </div>

          <hr className="border-t border-bg-muted/60 mb-6" />

          {/* Price Display */}
          <div className="flex items-baseline gap-3 mb-2">
            {original && (
              <span className="text-lg text-text-disabled line-through">
                ₹{original}
              </span>
            )}
            <span className="text-3xl font-bold text-primary">₹{price}</span>
          </div>

          {/* Stock Status Pill */}
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit mb-6 ${
              inStock
                ? "bg-emerald-100/70 text-success"
                : "bg-rose-100/70 text-danger"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                inStock ? "bg-success" : "bg-danger"
              }`}
            />
            {inStock ? "In Stock" : "Out of Stock"}
          </div>

          {/* Short Description Anchor */}
          <button
            type="button"
            className="text-left bg-transparent border-none cursor-pointer p-0 text-paragraph text-sm sm:text-base leading-relaxed mb-6 group"
            onClick={onScrollToDescription}
          >
            <span className="line-clamp-3 mb-1">{product?.description}</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-coffee group-hover:underline">
              Read full description <ArrowRight size={12} />
            </span>
          </button>

          <hr className="border-t border-bg-muted/60 mb-6" />

          {/* Spec Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-8">
            <SpecCard
              icon={<Flame size={16} />}
              label="Burn Time"
              value={product?.burnTime ? `~${product.burnTime} hours` : null}
            />
            <SpecCard
              icon={<Package size={16} />}
              label="Weight"
              value={product?.weight ? `${product.weight}g` : null}
            />
            <SpecCard
              icon={<Droplets size={16} />}
              label="Material"
              value={product?.material}
            />
            {product?.vessel && (
              <SpecCard
                icon={<Package size={16} />}
                label="Vessel"
                value={product.vessel}
              />
            )}
          </div>

          {/* Quantity Controls & CTA Buttons */}
          <div className="flex flex-col gap-3.5 mb-8">
            {/* Quantity Selector Row */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold tracking-wider uppercase text-text-muted w-12">
                Qty
              </span>
              <div className="flex items-center border border-bg-muted rounded overflow-hidden">
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center bg-transparent text-primary hover:bg-bg-canvas transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-bold text-heading border-x border-bg-muted">
                  {qty}
                </span>
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center bg-transparent text-primary hover:bg-bg-canvas transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
                  disabled={!inStock || qty >= maxStock}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              disabled={!inStock}
              className="w-full h-12 border-2 border-primary text-primary hover:bg-primary hover:text-white text-xs font-bold tracking-widest uppercase rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary cursor-pointer"
              onClick={() => addToCart(product, qty)}
            >
              Add to Cart
            </button>

            {/* Buy It Now Button */}
            <button
              type="button"
              disabled={!inStock}
              className="w-full h-12 bg-primary text-white hover:bg-primary/90 text-xs font-bold tracking-widest uppercase rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              onClick={handleBuyNow}
            >
              Buy It Now
            </button>
          </div>

          {/* Accordion FAQ Section */}
          <div className="border-t border-bg-muted/60">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                title={faq.title}
                content={faq.content}
                open={openFaq === idx}
                onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
              />
            ))}
          </div>

          {/* Trust Highlights */}
          <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-bg-muted/60 text-[11px] font-semibold tracking-wider text-text-muted uppercase">
            {["Handmade in Dehradun", "100% Soy Wax", "Ships in 48 hrs"].map(
              (label) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-coffee" />
                  {label}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {lightbox && <Lightbox />}
    </div>
  );
};

export default ProductZoom;