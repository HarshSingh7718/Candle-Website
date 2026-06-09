import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { trackViewContent } from '../utils/metaPixel';
import SEO from "../components/SEO";
import ProductZoom from "../components/ProductZoom";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { Star } from "lucide-react";
import ProductCard from "../components/ui/Cards/ProductCard";
import Loader from "../components/ui/Loader";
import { useSingleProduct } from "../hooks/useProducts";

/**
 * ShopDetails – Product detail page.
 *
 * Features:
 *  - Image zoom via ProductZoom
 *  - Tabs: Description (with Show More/Less), Additional Info, Reviews
 *  - Short description click scrolls to & opens the Description tab
 *  - Similar products grid
 */
const ShopDetails = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const { data, isLoading } = useSingleProduct(slug);

  // Extracting data safely
  const product = data?.product;
  const similarProducts = data?.similarProducts || [];
  const reviews = data?.reviews || [];

  const { liked, toggleWishlist } = useWishlist(product?._id);

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Ref for the tabs section so we can scroll to it
  const tabsSectionRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setQty(1);
    setShowFullDescription(false);
  }, [slug]);

  useEffect(() => {
    if (product) {
        trackViewContent(product);
    }
  }, [product]);

  /**
   * Scrolls to the Description tab section and opens it.
   * Passed down to ProductZoom so the short description acts as an anchor link.
   */
  const handleScrollToDescription = useCallback(() => {
    setActiveTab("description");
    // Slight delay so the tab content renders before we scroll
    setTimeout(() => {
      tabsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center pt-24 text-center">
        <div>
          <h2 className="text-3xl font-serif text-[#222] mb-4">
            Product Not Found
          </h2>
          <Link to="/collections" className="text-coffee hover:underline">
            Return to Collections
          </Link>
        </div>
      </div>
    );
  }

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images?.[0]?.url || "",
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "Naisha Creations",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <SEO
        title={`${product.name} | Naisha Creations`}
        description={product.description}
        image={product.images?.[0]?.url}
        schema={productSchema}
      />
      <div className="bg-light-yellow pb-1 pt-24">
        <div className="container mx-auto py-5 px-4 lg:px-8 w-full">
          <ProductZoom
            product={product}
            onScrollToDescription={handleScrollToDescription}
          />

          {/* ─────────────── Tabs Area ─────────────── */}
          <div className="mt-8" ref={tabsSectionRef} id="product-tabs">
            <div className="flex border-b border-muted gap-8 md:gap-10">
              {["description", "additional", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-xs cursor-pointer font-bold uppercase tracking-widest transition-all relative ${
                    activeTab === tab
                      ? "text-heading"
                      : "text-muted hover:text-heading"
                  }`}
                >
                  {tab === "reviews" ? `Reviews (${reviews?.length})` : tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="py-10 min-h-[200px]">
              {/* ── Description Tab with Show More / Show Less ── */}
              {activeTab === "description" && (
                <div className="text-paragraph text-[15px] leading-8 max-w-4xl">
                  <p
                    className={`whitespace-pre-line ${showFullDescription ? "line-clamp-none" : "line-clamp-4"}`}
                  >
                    {product.description}
                  </p>

                  {product.description && (
                    <button
                      onClick={() => setShowFullDescription((prev) => !prev)}
                      className="mt-4 text-sm font-semibold text-coffee hover:text-coffee-light transition-colors cursor-pointer underline underline-offset-4"
                    >
                      {showFullDescription ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>
              )}

              {/* ── Additional Info Tab ── */}
              {activeTab === "additional" && (
                <div className="text-paragraph text-sm max-w-lg">
                  {product.vessel && (
                    <div className="grid grid-cols-2 py-3 border-b border-muted/20">
                      <span className="font-bold text-heading uppercase tracking-wider">
                        Vessel
                      </span>
                      <span>{product.vessel}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 py-3 border-b border-muted/20">
                    <span className="font-bold text-heading uppercase tracking-wider">
                      Weight
                    </span>
                    <span>{product.weight} g</span>
                  </div>
                  <div className="grid grid-cols-2 py-3 border-b border-muted/20">
                    <span className="font-bold text-heading uppercase tracking-wider">
                      Materials
                    </span>
                    <span>{product.material}</span>
                  </div>
                  <div className="grid grid-cols-2 py-3 border-b border-muted/20">
                    <span className="font-bold text-heading uppercase tracking-wider">
                      Burn Time
                    </span>
                    <span>~{product.burnTime} Hours</span>
                  </div>
                </div>
              )}

              {/* ── Reviews Tab ── */}
              {activeTab === "reviews" && (
                <div className="space-y-8">
                  {reviews?.length === 0 && (
                    <p className="text-muted italic">
                      No reviews yet for this product.
                    </p>
                  )}
                  {reviews?.map((review, idx) => (
                    <div key={idx} className="border-b border-muted/20 pb-8">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-bold text-heading uppercase tracking-widest text-s">
                            {review.user}
                          </h4>
                          <p className="text-[10px] text-muted mt-1">
                            {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < review.rating ? "black" : "none"}
                              className={
                                i < review.rating
                                  ? "fill-[#ffb400] text-[#ffb400]"
                                  : "text-orange-400"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-paragraph text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─────────────── Similar Products ─────────────── */}
          <div>
            <span className="title-span">- You may also like -</span>
            <h2 className="heading-1 mb-5">
              Similar <span className="text-coffee"> Products </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopDetails;
