import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useSearchParams, useLocation } from "react-router-dom";
import { Filter, X, SlidersHorizontal } from "lucide-react";

import ProductCard from "../components/ui/Cards/ProductCard";
import ProductCardSkeleton from "../components/ui/Skeletons/ProductCardSkeleton";
import SEO from "../components/SEO";
import PageBanner from "../components/ui/PageBanner";
import MobileFilterModal from "../components/ui/MobileFilterModal";
import CustomDropdown from "../components/ui/CustomDropdown";
import { useProducts, useCategoryBySlug } from "../hooks/useProducts";
import { useDebounce } from "../hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import API from "../api";

gsap.registerPlugin(ScrollTrigger);

const Candles = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || "";
  const queryPrice = searchParams.get("maxPrice") || null;
  const querySort = searchParams.get("sort") || "latest";
  const queryFilter = searchParams.get("filter") || null;
  const queryCategory = searchParams.get("category") || null;
  const location = useLocation();

  const [priceInput, setPriceInput] = useState(queryPrice || 3000);
  const [sortInput, setSortInput] = useState(querySort);
  const [categoryInput, setCategoryInput] = useState(queryCategory || "");
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
    category: queryCategory,
  });

  const { data: categoryData, isLoading: isCategoryLoading } = useCategoryBySlug(queryCategory);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await API.get('/categories');
      return data.categories;
    }
  });

  const products = responseData?.pages?.flatMap((page) => page.candles) || [];
  const totalProducts = responseData?.pages?.[0]?.total || 0;

  const sortLabels = {
    latest: "Latest",
    popularity: "Popularity",
    "low-to-high": "Price: Low to High",
    "high-to-low": "Price: High to Low",
  };
  const sliderPct = Math.min(100, Math.max(0, (priceInput / 3000) * 100));
  const hasActiveFilters = queryPrice !== null || (querySort && querySort !== "latest") || queryCategory !== null;

  const clearPriceFilter = () => setPriceInput(3000);
  const clearSortFilter = () => setSortInput("latest");
  const clearCategoryFilter = () => setCategoryInput("");

  // ── Sentinel ref for infinite scroll ──
  const sentinelRef = useRef(null);
  const sidebarRef = useRef();
  const mainRef = useRef();

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
    setSearchParams(newParams, { replace: true });
  }, [debouncedPrice]);

  // ── Sync Sort to URL ──
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (sortInput && sortInput !== "latest") {
      newParams.set("sort", sortInput);
    } else {
      newParams.delete("sort");
    }
    setSearchParams(newParams, { replace: true });
  }, [sortInput]);

  // ── Sync Category to URL ──
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryInput) {
      newParams.set("category", categoryInput);
    } else {
      newParams.delete("category");
    }
    setSearchParams(newParams, { replace: true });
  }, [categoryInput]);

  // ── Scroll to top of products when filters change ──
  useEffect(() => {
    const smoother = ScrollSmoother.get();
    if (smoother && mainRef.current) {
      smoother.scrollTo(mainRef.current, true, "top 100px");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [querySearch, querySort, debouncedPrice, queryFilter, queryCategory]);

  const handleMobileApply = ({ sort, maxPrice, category }) => {
    const newParams = new URLSearchParams(searchParams);
    if (sort && sort !== "latest") newParams.set("sort", sort);
    else newParams.delete("sort");

    if (maxPrice && maxPrice < 3000) newParams.set("maxPrice", maxPrice);
    else newParams.delete("maxPrice");

    if (category) newParams.set("category", category);
    else newParams.delete("category");

    setSearchParams(newParams, { replace: true });
    setIsMobileFilterOpen(false);
  };

  const sortOptions = [
    { value: "latest", label: "Sort by latest" },
    { value: "popularity", label: "Sort by Popularity" },
    { value: "low-to-high", label: "Sort by Low to High" },
    { value: "high-to-low", label: "Sort by High to Low" },
  ];

  const categoryOptions = [
    { value: "", label: "All Collections" },
    ...categories.map(c => ({ value: c.slug, label: c.name }))
  ];

  // ── GSAP sidebar animation & pinning ──
  const productsCount = products.length;

  useEffect(() => {
    if (!sidebarRef.current || !mainRef.current) return;
    
    let ctx;

    const initSidebarGSAP = () => {
      // Race condition fix: Wait for App.jsx to initialize ScrollSmoother
      if (!ScrollSmoother.get()) {
        requestAnimationFrame(initSidebarGSAP);
        return;
      }

      ctx = gsap.context(() => {
        const q = gsap.utils.selector(sidebarRef);
        q(".sidebar-box").forEach((box) => {
          gsap.from(box.querySelector(".sidebar-title"), {
            x: 30,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: box,
              start: "top 95%",
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
        
        // Pin sidebar for desktop (mimics position: sticky inside ScrollSmoother)
        const mm = gsap.matchMedia();
        mm.add("(min-width: 1024px)", () => {
          ScrollTrigger.create({
            trigger: sidebarRef.current,
            start: "top 112px", // 112px matches top-28 (28 * 4)
            end: () => `+=${Math.max(0, mainRef.current.offsetHeight - sidebarRef.current.offsetHeight)}`,
            pin: true,
            // pinSpacing: true is default. Required here so the flex column doesn't collapse!
            invalidateOnRefresh: true,
          });
        });
      }, sidebarRef);
    };

    initSidebarGSAP();

    return () => {
      if (ctx) ctx.revert();
    };
  }, [productsCount]); // Depend on count, not the array reference to prevent excessive re-runs!

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
      <PageBanner 
        title={categoryData ? categoryData.name : "Candles"} 
        currentPage="Candles" 
        bgImage={categoryData?.bannerImage?.url}
        isLoading={!!queryCategory && isCategoryLoading}
      />
      <div className="bg-bg-canvas min-h-screen">
        <div className="container mx-auto px-4 py-[8%]">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Sidebar ── */}
            <aside className="w-full lg:w-1/4 space-y-8 order-2 lg:order-1">
              <div ref={sidebarRef} className="w-full">
                <div className="bg-bg-surface rounded-sm shadow-sm hidden lg:block sidebar-box border border-bg-muted/60">
                  <div className="flex items-center gap-2 px-6 py-4 border-b border-bg-muted/60 sidebar-title">
                  <SlidersHorizontal size={16} className="text-brand-primary" />
                  <h3 className="text-sm font-semibold tracking-wide uppercase text-text-base">
                    Refine
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        clearPriceFilter();
                        clearSortFilter();
                        clearCategoryFilter();
                      }}
                      className="ml-auto text-[11px] font-medium text-danger hover:text-danger/80 cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="sidebar-content p-6 space-y-6">
                  {/* Price */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold tracking-wide uppercase text-text-muted">
                        Price
                      </span>
                      <span className="text-sm font-medium text-brand-primary">
                        {priceInput < 3000 ? `Up to ₹${priceInput}` : "Any price"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3000"
                      step="50"
                      value={priceInput}
                      onChange={(e) => setPriceInput(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-brand-primary"
                      style={{
                        background: `linear-gradient(to right, var(--color-brand-primary, #b45309) ${sliderPct}%, rgb(0 0 0 / 0.08) ${sliderPct}%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs mt-2 text-text-muted">
                      <span>₹0</span>
                      <span>₹3,000+</span>
                    </div>
                  </div>

                  <div className="h-px bg-bg-muted/60" />

                  {/* Collection */}
                  <div>
                    <span className="text-xs font-semibold tracking-wide uppercase text-text-muted block mb-3">
                      Collection
                    </span>
                    <CustomDropdown
                      options={categoryOptions}
                      value={categoryInput}
                      onChange={setCategoryInput}
                    />
                  </div>

                  <div className="h-px bg-bg-muted/60" />

                  {/* Sort */}
                  <div>
                    <span className="text-xs font-semibold tracking-wide uppercase text-text-muted block mb-3">
                      Sort by
                    </span>
                    <CustomDropdown
                      options={sortOptions}
                      value={sortInput}
                      onChange={setSortInput}
                    />
                  </div>
                </div>
                </div>
              </div>
            </aside>

            {/* ── Main Content ── */}
            <main ref={mainRef} className="w-full lg:w-3/4 order-1 lg:order-2">

              {/* Top bar */}
              <div className="flex flex-col gap-4 mb-8 top-bar">
                <div className="flex justify-between items-center gap-4">
                  <p className="text-sm text-text-muted">
                    {isLoading
                      ? "Loading candles…"
                      : `Showing ${products.length} of ${totalProducts} candle${
                          totalProducts === 1 ? "" : "s"
                        }`}
                  </p>

                  <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 bg-bg-surface border border-bg-muted px-4 py-2 rounded-md shadow-sm text-text-base font-medium hover:bg-bg-surface-hover transition-colors"
                  >
                    <Filter size={18} />
                    Filters
                  </button>
                </div>

                {/* Active filter chips */}
                {hasActiveFilters && (
                  <div className="hidden lg:flex flex-wrap items-center gap-2">
                    {queryPrice !== null && (
                      <button
                        onClick={clearPriceFilter}
                        className="flex items-center gap-1.5 text-xs font-medium bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full hover:bg-brand-primary/20 transition-colors cursor-pointer"
                      >
                        Up to ₹{queryPrice}
                        <X size={12} />
                      </button>
                    )}
                    {querySort && querySort !== "latest" && (
                      <button
                        onClick={clearSortFilter}
                        className="flex items-center gap-1.5 text-xs font-medium bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full hover:bg-brand-primary/20 transition-colors cursor-pointer"
                      >
                        {sortLabels[querySort]}
                        <X size={12} />
                      </button>
                    )}
                    {queryCategory && categoryData && (
                      <button
                        onClick={clearCategoryFilter}
                        className="flex items-center gap-1.5 text-xs font-medium bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full hover:bg-brand-primary/20 transition-colors cursor-pointer"
                      >
                        {categoryData.name}
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )}
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
                  <h3 className="text-xl font-medium text-text-muted mb-2">
                    No candles match your filters
                  </h3>
                  <p className="text-sm text-text-disabled mb-6">
                    Try widening your price range or clearing the sort.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        clearPriceFilter();
                        clearSortFilter();
                        clearCategoryFilter();
                      }}
                      className="text-sm font-medium text-brand-primary hover:underline cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  )}
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
        initialCategory={queryCategory}
        categoryOptions={categoryOptions}
        onApply={handleMobileApply}
      />
    </>
  );
};

export default Candles;