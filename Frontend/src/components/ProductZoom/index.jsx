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
import { trackAddToCart } from "../../utils/metaPixel";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { useNavigate } from "react-router-dom";

/* ─── Design tokens ──────────────────────────────────────────────────── */
const t = {
  brandPrimary:      "#5e3232",
  brandSecondary:    "#a67067",
  bgCanvas:          "#fce8e8",
  bgSurface:         "#ffffff",
  bgSurfaceHover:    "#f5dfdf",
  bgMuted:           "#e5d5d5",
  textBase:          "#221f1f",
  textMuted:         "#595554",
  textDisabled:      "#9e9a99",
  textOnBrand:       "#ffffff",
  success:           "#16a34a",
  danger:            "#dc2626",
};

/* ─── Inline style helpers ────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: "100vh",
    background: t.bgCanvas,
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: t.textBase,
    overflowX: "hidden",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    minHeight: "100vh",
  },
  // Left: sticky gallery
  galleryCol: {
    position: "sticky",
    top: 0,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: t.bgCanvas,
    overflow: "hidden",
  },
  mainImgWrap: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    cursor: "zoom-in",
  },
  mainImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
  },
  thumbRail: {
    display: "flex",
    gap: 8,
    padding: "12px 16px",
    background: t.bgCanvas,
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  // Right: details scroll
  detailsCol: {
    background: t.bgSurface,
    padding: "48px 40px 80px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  eyebrow: {
    fontFamily: "'Arial', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: t.brandSecondary,
    marginBottom: 14,
  },
  h1: {
    fontFamily: "'Georgia', serif",
    fontSize: 30,
    fontWeight: 400,
    lineHeight: 1.25,
    color: t.textBase,
    margin: "0 0 20px",
  },
  divider: {
    border: "none",
    borderTop: `1px solid ${t.bgMuted}`,
    margin: "24px 0",
  },
  priceWrap: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
    marginBottom: 6,
  },
  priceMain: {
    fontSize: 34,
    fontWeight: 700,
    fontFamily: "'Georgia', serif",
    color: t.brandPrimary,
  },
  priceStrike: {
    fontSize: 18,
    fontWeight: 400,
    color: t.textDisabled,
    textDecoration: "line-through",
  },
  stockPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    fontFamily: "'Arial', sans-serif",
    color: t.success,
    background: "#dcfce7",
    borderRadius: 100,
    padding: "3px 10px",
    fontWeight: 600,
    marginBottom: 20,
    width: "fit-content",
  },
  outOfStockPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    fontFamily: "'Arial', sans-serif",
    color: t.danger,
    background: "#fee2e2",
    borderRadius: 100,
    padding: "3px 10px",
    fontWeight: 600,
    marginBottom: 20,
    width: "fit-content",
  },
  starsRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  descBtn: {
    textAlign: "left",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    color: t.textMuted,
    fontFamily: "'Georgia', serif",
    fontSize: 15,
    lineHeight: 1.75,
    marginBottom: 28,
  },
  readMore: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontFamily: "'Arial', sans-serif",
    fontSize: 12,
    color: t.brandSecondary,
    fontWeight: 600,
    letterSpacing: "0.05em",
    marginTop: 6,
  },
  // Quantity
  qtyWrap: {
    display: "flex",
    alignItems: "center",
    border: `1.5px solid ${t.bgMuted}`,
    borderRadius: 4,
    overflow: "hidden",
    width: "fit-content",
  },
  qtyBtn: {
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: t.brandPrimary,
    transition: "background 0.15s",
  },
  qtyNum: {
    width: 44,
    textAlign: "center",
    fontFamily: "'Georgia', serif",
    fontWeight: 700,
    fontSize: 16,
    color: t.textBase,
    borderLeft: `1px solid ${t.bgMuted}`,
    borderRight: `1px solid ${t.bgMuted}`,
  },
  // CTA buttons
  btnCart: {
    width: "100%",
    height: 52,
    background: "none",
    border: `1.5px solid ${t.brandPrimary}`,
    color: t.brandPrimary,
    fontFamily: "'Arial', sans-serif",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
    borderRadius: 2,
  },
  btnBuy: {
    width: "100%",
    height: 52,
    background: t.brandPrimary,
    border: "none",
    color: t.textOnBrand,
    fontFamily: "'Arial', sans-serif",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "background 0.2s",
    borderRadius: 2,
  },
  // Spec pills
  specGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    margin: "0 0 24px",
  },
  specCard: {
    background: t.bgCanvas,
    border: `1px solid ${t.bgMuted}`,
    borderRadius: 6,
    padding: "12px 14px",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  specIcon: {
    color: t.brandSecondary,
    flexShrink: 0,
    marginTop: 1,
  },
  specLabel: {
    fontFamily: "'Arial', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: t.textMuted,
    marginBottom: 2,
  },
  specVal: {
    fontFamily: "'Georgia', serif",
    fontSize: 14,
    color: t.textBase,
  },
  // Accordion
  accordionItem: {
    borderBottom: `1px solid ${t.bgMuted}`,
  },
  accordionBtn: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Arial', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: t.textBase,
  },
  accordionBody: {
    fontFamily: "'Georgia', serif",
    fontSize: 14,
    color: t.textMuted,
    lineHeight: 1.8,
    overflow: "hidden",
    transition: "max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease",
  },
  // Wishlist pill
  wishlistBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 40,
    background: "rgba(252,232,232,0.92)",
    backdropFilter: "blur(4px)",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(94,50,50,0.12)",
    transition: "transform 0.15s",
  },
  // Lightbox
  lightboxOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(34,31,31,0.97)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  lightboxClose: {
    position: "absolute",
    top: 20,
    right: 20,
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    opacity: 0.7,
    transition: "opacity 0.15s",
  },
  lightboxImg: {
    maxWidth: "100%",
    maxHeight: "75vh",
    objectFit: "contain",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  lightboxThumbRail: {
    display: "flex",
    gap: 10,
    marginTop: 20,
    overflowX: "auto",
    scrollbarWidth: "none",
  },
};

/* ─── Thumb button ────────────────────────────────────────────────────── */
function Thumb({ src, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 60,
        aspectRatio: "4/5",
        flexShrink: 0,
        border: `2px solid ${active ? t.brandPrimary : "transparent"}`,
        opacity: active ? 1 : 0.55,
        overflow: "hidden",
        cursor: "pointer",
        transition: "opacity 0.15s, border-color 0.15s",
        borderRadius: 2,
        background: "none",
        padding: 0,
      }}
    >
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </button>
  );
}

/* ─── Spec card ───────────────────────────────────────────────────────── */
function SpecCard({ icon, label, value }) {
  if (!value) return null;
  return (
    <div style={styles.specCard}>
      <span style={styles.specIcon}>{icon}</span>
      <div>
        <div style={styles.specLabel}>{label}</div>
        <div style={styles.specVal}>{value}</div>
      </div>
    </div>
  );
}

/* ─── Accordion item ──────────────────────────────────────────────────── */
function AccordionItem({ title, content, open, onToggle }) {
  return (
    <div style={styles.accordionItem}>
      <button style={styles.accordionBtn} onClick={onToggle}>
        <span>{title}</span>
        {open ? <ChevronUp size={16} strokeWidth={1.5} color={t.textMuted} /> : <ChevronDown size={16} strokeWidth={1.5} color={t.textMuted} />}
      </button>
      <div
        style={{
          ...styles.accordionBody,
          maxHeight: open ? 200 : 0,
          opacity: open ? 1 : 0,
          paddingBottom: open ? 16 : 0,
        }}
      >
        {content}
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */
const ProductZoom = ({ product, onScrollToDescription }) => {
  const navigate  = useNavigate();
  const { addToCart }                  = useCart();
  const { liked: isWishlisted, toggleWishlist } = useWishlist(product?._id);

  const [activeIdx,      setActiveIdx]      = useState(0);
  const [openFaq,        setOpenFaq]        = useState(null);
  const [qty,            setQty]            = useState(1);
  const [lightbox,       setLightbox]       = useState(false);
  const [cartHover,      setCartHover]      = useState(false);
  const [buyHover,       setBuyHover]       = useState(false);
  const [imgHover,       setImgHover]       = useState(false);
  const [isDesktop,      setIsDesktop]      = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  const imageUrls = product?.images?.map((i) => i.url) || ["/images/placeholder.jpg"];
  const inStock   = product?.stock > 0;
  const price     = product?.discountPrice > 0 ? product.discountPrice : product?.price;
  const original  = product?.discountPrice > 0 ? product?.price : null;
  const discount  = original ? Math.round(((original - price) / original) * 100) : null;

  const handleBuyNow = async () => {
    await addToCart(product, qty);
    await trackAddToCart(product, qty);
    navigate("/checkout");
  };

  const faqs = [
    {
      title: "About Naisha Creations",
      content: "We are a Dehradun-based handmade candle studio crafting premium, smokeless soy wax candles designed to elevate your living space. Every piece is poured by hand with love.",
    },
    {
      title: "Fragrance Notes",
      content: product?.scent || "Formulated with the highest quality fragrance oils. Each scent is carefully chosen for clarity, longevity, and mood.",
    },
    {
      title: "Delivery & Packaging",
      content: "Ships within 48 hours. Packed in eco-friendly tissue wrap and a gift-ready box. Available for gifting with a personal note — DM us to arrange.",
    },
  ];

  /* ── Gallery ─────────────────────────────────────────────── */
  const Gallery = () => (
    <div style={isDesktop ? styles.galleryCol : { background: t.bgCanvas }}>
      {/* Main image */}
      <div
        style={{
          ...styles.mainImgWrap,
          ...(isDesktop ? { flex: 1 } : { aspectRatio: "4/5" }),
        }}
        onClick={() => setLightbox(true)}
        onMouseEnter={() => setImgHover(true)}
        onMouseLeave={() => setImgHover(false)}
      >
        <img
          src={imageUrls[activeIdx]}
          alt={product?.name}
          style={{
            ...styles.mainImg,
            transform: imgHover ? "scale(1.06)" : "scale(1)",
          }}
        />
        {/* Wishlist */}
        <button
          style={styles.wishlistBtn}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
        >
          <Heart
            size={18}
            style={{
              fill: isWishlisted ? t.danger : "none",
              color: isWishlisted ? t.danger : t.textMuted,
              transition: "all 0.2s",
            }}
          />
        </button>
        {/* Discount badge */}
        {discount && (
          <div style={{
            position: "absolute",
            top: 16,
            left: 16,
            background: t.brandPrimary,
            color: "#fff",
            fontFamily: "'Arial', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 2,
            letterSpacing: "0.08em",
          }}>
            -{discount}%
          </div>
        )}
        {/* Zoom hint */}
        <div style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          background: "rgba(252,232,232,0.85)",
          backdropFilter: "blur(4px)",
          fontFamily: "'Arial', sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: t.brandPrimary,
          padding: "4px 10px",
          borderRadius: 100,
          opacity: imgHover ? 1 : 0,
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }}>
          CLICK TO ZOOM
        </div>
      </div>

      {/* Thumbnail rail */}
      {imageUrls.length > 1 && (
        <div style={styles.thumbRail}>
          {imageUrls.map((url, idx) => (
            <Thumb
              key={idx}
              src={url}
              active={activeIdx === idx}
              onClick={() => setActiveIdx(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );

  /* ── Details ─────────────────────────────────────────────── */
  const Details = () => (
    <div style={styles.detailsCol}>
      {/* Collection eyebrow */}
      <div style={styles.eyebrow}>
        {product?.category?.map(c => c.name).join(" · ") || "Naisha Creations"}
      </div>

      {/* Name */}
      <h1 style={styles.h1}>{product?.name}</h1>

      {/* Stars */}
      <div style={styles.starsRow}>
        <div style={{ display: "flex", gap: 2 }}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              style={{
                fill: i < (product?.ratings || 0) ? "#c88b47" : "none",
                color: i < (product?.ratings || 0) ? "#c88b47" : t.bgMuted,
              }}
            />
          ))}
        </div>
        <span style={{ fontFamily: "'Arial', sans-serif", fontSize: 12, color: t.textMuted }}>
          {product?.numOfReviews || 0} reviews
        </span>
      </div>

      <hr style={styles.divider} />

      {/* Price */}
      <div style={styles.priceWrap}>
        {original && <span style={styles.priceStrike}>₹{original}</span>}
        <span style={styles.priceMain}>₹{price}</span>
      </div>

      {/* Stock */}
      <div style={inStock ? styles.stockPill : styles.outOfStockPill}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: inStock ? t.success : t.danger,
          display: "inline-block",
        }} />
        {inStock ? "In Stock" : "Out of Stock"}
      </div>

      {/* Short description */}
      <button style={styles.descBtn} onClick={onScrollToDescription}>
        <span style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product?.description}
        </span>
        <span style={styles.readMore}>
          Read full description <ArrowRight size={12} />
        </span>
      </button>

      <hr style={styles.divider} />

      {/* Spec grid */}
      <div style={styles.specGrid}>
        <SpecCard icon={<Flame size={16} />} label="Burn Time" value={product?.burnTime ? `${product.burnTime} hours` : null} />
        <SpecCard icon={<Package size={16} />} label="Weight" value={product?.weight ? `${product.weight}g` : null} />
        <SpecCard icon={<Droplets size={16} />} label="Material" value={product?.material} />
        {product?.vessel && <SpecCard icon={<Package size={16} />} label="Vessel" value={product.vessel} />}
      </div>

      {/* Qty + CTAs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {/* Quantity row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "'Arial', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textMuted, minWidth: 52 }}>
            Qty
          </span>
          <div style={styles.qtyWrap}>
            <button
              style={styles.qtyBtn}
              onClick={() => {
                  addToCart(product, qty)
                  trackAddToCart(product, qty);
              }}
              onMouseEnter={e => e.currentTarget.style.background = t.bgCanvas}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <Minus size={14} />
            </button>
            <span style={styles.qtyNum}>{qty}</span>
            <button
              style={styles.qtyBtn}
              onClick={() => setQty(q => q + 1)}
              onMouseEnter={e => e.currentTarget.style.background = t.bgCanvas}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Add to cart */}
        <button
          disabled={!inStock}
          style={{
            ...styles.btnCart,
            background: cartHover && inStock ? t.brandPrimary : "none",
            color: cartHover && inStock ? t.textOnBrand : t.brandPrimary,
            opacity: inStock ? 1 : 0.4,
            cursor: inStock ? "pointer" : "not-allowed",
          }}
          onMouseEnter={() => setCartHover(true)}
          onMouseLeave={() => setCartHover(false)}
          onClick={() => addToCart(product, qty)}
        >
          Add to Cart
        </button>

        {/* Buy now */}
        <button
          disabled={!inStock}
          style={{
            ...styles.btnBuy,
            background: buyHover && inStock ? "#7a3f3f" : t.brandPrimary,
            opacity: inStock ? 1 : 0.4,
            cursor: inStock ? "pointer" : "not-allowed",
          }}
          onMouseEnter={() => setBuyHover(true)}
          onMouseLeave={() => setBuyHover(false)}
          onClick={handleBuyNow}
        >
          Buy It Now
        </button>
      </div>

      {/* Accordion */}
      <div style={{ borderTop: `1px solid ${t.bgMuted}` }}>
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

      {/* Trust row */}
      <div style={{
        display: "flex",
        gap: 24,
        marginTop: 32,
        paddingTop: 24,
        borderTop: `1px solid ${t.bgMuted}`,
        flexWrap: "wrap",
      }}>
        {["Handmade in Dehradun", "100% Soy Wax", "Ships in 48 hrs"].map(label => (
          <div key={label} style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "'Arial', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: t.textMuted,
            textTransform: "uppercase",
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: t.brandSecondary, flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Lightbox ─────────────────────────────────────────────── */
  const Lightbox = () => createPortal(
    <div style={styles.lightboxOverlay} onClick={() => setLightbox(false)}>
      <button style={styles.lightboxClose} onClick={e => { e.stopPropagation(); setLightbox(false); }}>
        <X size={28} />
      </button>

      <img
        src={imageUrls[activeIdx]}
        alt={product?.name}
        style={styles.lightboxImg}
        onClick={e => e.stopPropagation()}
      />

      {imageUrls.length > 1 && (
        <div style={styles.lightboxThumbRail} onClick={e => e.stopPropagation()}>
          {imageUrls.map((url, idx) => (
            <button
              key={idx}
              onClick={e => { e.stopPropagation(); setActiveIdx(idx); }}
              style={{
                width: 56,
                aspectRatio: "4/5",
                flexShrink: 0,
                border: `2px solid ${activeIdx === idx ? "#fff" : "transparent"}`,
                opacity: activeIdx === idx ? 1 : 0.45,
                overflow: "hidden",
                cursor: "pointer",
                borderRadius: 2,
                background: "none",
                padding: 0,
                transition: "opacity 0.15s, border-color 0.15s",
              }}
            >
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div style={styles.page}>
      {isDesktop ? (
        /* Desktop: side-by-side sticky gallery */
        <div style={{ ...styles.grid, gridTemplateColumns: "48% 52%" }}>
          <Gallery />
          <div style={{ overflowY: "auto" }}>
            <Details />
          </div>
        </div>
      ) : (
        /* Mobile: stacked */
        <div>
          <Gallery />
          <Details />
        </div>
      )}
      {lightbox && <Lightbox />}
    </div>
  );
};

export default ProductZoom;