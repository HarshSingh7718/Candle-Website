import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useSearchParams, useLocation } from "react-router-dom";
import { Filter } from "lucide-react";

import ProductCard from "../components/ui/Cards/ProductCard";
import ProductCardSkeleton from "../components/ui/Skeletons/ProductCardSkeleton";
import SEO from "../components/SEO";
import PageBanner from "../components/ui/PageBanner";
import MobileFilterModal from "../components/ui/MobileFilterModal";
import CustomDropdown from "../components/ui/CustomDropdown";
import { useProducts } from "../hooks/useProducts";
import { useDebounce } from "../hooks/useDebounce";

gsap.registerPlugin(ScrollTrigger);

const Candles = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || "";
  const queryPrice = searchParams.get("maxPrice") || null;
  const querySort = searchParams.get("sort") || "latest";
  const queryFilter = searchParams.get("filter") || null;
  const location = useLocation();

  const [priceInput, setPriceInput] = useState(queryPrice || 3000);
  const [sortInput, setSortInput] = useState(querySort);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const debouncedPrice = useDebounce(priceInput, 500);

  const {
    data: responseData,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts({
    search: querySearch,
    maxPrice: debouncedPrice,
    sort: sortInput,
    filter: queryFilter,
  });

  const products = responseData?.pages?.flatMap((page) => page.candles) || [];
  const totalProducts = responseData?.pages?.[0]?.total || 0;

  // ── Sentinel ref for infinite scroll ──
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;

    const st = ScrollTrigger.create({
      trigger: sentinelRef.current,
      start: "top 95%",
      onEnter: () => {
        if (!isFetchingNextPage && hasNextPage) {
          fetchNextPage();
        }
      },
    });

    return () => st.kill();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Sync Debounced Price to URL ──
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (debouncedPrice && debouncedPrice < 3000) {
      newParams.set("maxPrice", debouncedPrice);
    } else {
      newParams.delete("maxPrice");
    }
    setSearchParams(newParams);
  }, [debouncedPrice]);

  // ── Sync Sort to URL ──
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (sortInput && sortInput !== "latest") {
      newParams.set("sort", sortInput);
    } else {
      newParams.delete("sort");
    }
    setSearchParams(newParams);
  }, [sortInput]);

  // ── Scroll to top of products when filters change ──
  useEffect(() => {
    const smoother = ScrollSmoother.get();
    if (smoother && mainRef.current) {
      smoother.scrollTo(mainRef.current, true, "top 100px");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [querySearch, querySort, debouncedPrice, queryFilter]);

  const handleMobileApply = ({ sort, maxPrice }) => {
    const newParams = new URLSearchParams(searchParams);
    if (sort && sort !== "latest") newParams.set("sort", sort);
    else newParams.delete("sort");
    if (maxPrice && maxPrice < 3000) newParams.set("maxPrice", maxPrice);
    else newParams.delete("maxPrice");
    setSearchParams(newParams);
    setSortInput(sort || "latest");
    setPriceInput(maxPrice || 3000);
  };

  const sortOptions = [
    { value: "latest", label: "Sort by latest" },
    { value: "popularity", label: "Sort by Popularity" },
    { value: "low-to-high", label: "Sort by Low to High" },
    { value: "high-to-low", label: "Sort by High to Low" },
  ];

  const sidebarRef = useRef();
  const mainRef = useRef();

  // ── GSAP sidebar animation ──
  useEffect(() => {
    if (!sidebarRef.current) return;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(sidebarRef);
      const boxes = q(".sidebar-box");
      boxes.forEach((box) => {
        gsap.from(box.querySelector(".sidebar-title"), {
          x: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: box,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
        gsap.from(box.querySelector(".sidebar-content"), {
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: box,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    }, sidebarRef);
    return () => ctx.revert();
  }, []);

  // ── GSAP product grid entrance animation (initial load only) ──
  useEffect(() => {
    if (!mainRef.current || isLoading) return;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(mainRef);
      gsap.from(q(".top-bar"), {
        y: -40,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: mainRef.current,
          start: "top 95%",
          toggleActions: "play none none none",
        },
      });
      gsap.from(q(".product-grid > .product-card-animate"), {
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: mainRef.current,
          start: "top 95%",
          toggleActions: "play none none none",
        },
      });
    }, mainRef);
    return () => ctx.revert();
  }, [isLoading]);

  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${location.pathname}` : '';

  return (
    <>
      <SEO
        title="Shop All Candles | Naisha Creations"
        description="Shop our full range of luxury scented candles. Hand-poured with eco-friendly soy wax and premium fragrance oils."
        canonical={canonicalUrl}
      />
      <PageBanner title="Candles" currentPage="Candles" />
      <div className="bg-bg-canvas min-h-screen">
        <div className="container mx-auto px-4 py-[8%]">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Sidebar ── */}
            <aside
              ref={sidebarRef}
              className="w-full lg:w-1/4 space-y-8 order-2 lg:order-1"
            >
              <div className="bg-bg-surface p-6 rounded-sm shadow-sm hidden lg:block sidebar-box">
                <h3 className="text-xl font-medium mb-4 sidebar-title flex justify-between items-center text-text-base">
                  Filter By Price
                  {queryPrice !== null && (
                    <button
                      onClick={() => setPriceInput(3000)}
                      className="text-[10px] bg-danger/10 text-danger px-2 py-1 rounded cursor-pointer hover:bg-danger/20"
                    >
                      Reset
                    </button>
                  )}
                </h3>
                <div className="sidebar-content">
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    value={priceInput}
                    onChange={(e) => setPriceInput(Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-sm mt-2 font-medium text-text-base">
                    <span>₹0</span>
                    <span>
                      {priceInput < 3000 ? `Max: ₹${priceInput}` : "No Max"}
                    </span>
                  </div>
                  <div className="mt-6">
                    <CustomDropdown
                      options={sortOptions}
                      value={sortInput}
                      onChange={setSortInput}
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Main Content ── */}
            <main ref={mainRef} className="w-full lg:w-3/4 order-1 lg:order-2">

              {/* Top bar */}
              <div className="flex justify-between items-center mb-8 gap-4 top-bar">
                
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-bg-surface border border-bg-muted px-4 py-2 rounded-md shadow-sm text-text-base font-medium hover:bg-bg-surface-hover transition-colors"
                >
                  <Filter size={18} />
                  Filters
                </button>
              </div>

              {/* Initial load — full skeleton grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10 product-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>

              ) : products.length > 0 ? (
                <>
                  {/* Product grid — fades only on filter refetch, never on next-page fetch */}
                  <div
                    className={`grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10 product-grid transition-opacity duration-300 ${
                      isFetching && !isFetchingNextPage
                        ? "opacity-50 pointer-events-none"
                        : "opacity-100"
                    }`}
                  >
                    {products.map((item) => (
                      <div key={item._id} className="product-card-animate">
                        <ProductCard product={item} />
                      </div>
                    ))}

                    {/* Skeleton cards appended inside grid while fetching next page */}
                    {isFetchingNextPage &&
                      Array.from({ length: 4 }).map((_, i) => (
                        <ProductCardSkeleton key={`skeleton-${i}`} />
                      ))}
                  </div>

                  {/* Invisible sentinel — triggers next page fetch */}
                  <div ref={sentinelRef} className="h-20 w-full mt-4" />

                  {/* End of results */}
                  {!hasNextPage && products.length > 0 && (
                    <p className="text-center text-text-muted text-sm py-8 italic">
                      You've seen all products ✨
                    </p>
                  )}
                </>

              ) : (
                <div className="text-center py-20 bg-bg-surface rounded-xl shadow-sm border border-bg-muted">
                  <Filter className="mx-auto text-text-disabled mb-4" size={48} />
                  <h3 className="text-xl font-medium text-text-muted">
                    No products match your filters.
                  </h3>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <MobileFilterModal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        initialSort={querySort}
        initialPrice={queryPrice ? Number(queryPrice) : 3000}
        onApply={handleMobileApply}
      />
    </>
  );
};

export default Candles;