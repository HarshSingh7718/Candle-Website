import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useSearchParams, useLocation } from "react-router-dom";
import { Search, ChevronDown, Filter } from "lucide-react";

import ProductCard from "../components/ui/Cards/ProductCard";
import SEO from "../components/SEO";
import PageBanner from "../components/ui/PageBanner";
import MobileFilterModal from "../components/ui/MobileFilterModal";
import CustomDropdown from "../components/ui/CustomDropdown";
import { useProducts } from "../hooks/useProducts";
import { useDebounce } from "../hooks/useDebounce";
import ProductCardSkeleton from "../components/ui/Skeletons/ProductCardSkeleton";

gsap.registerPlugin(ScrollTrigger);

const Candles = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || "";
  const queryPrice = searchParams.get("maxPrice") || null;
  const querySort = searchParams.get("sort") || "latest";
  const queryFilter = searchParams.get("filter") || null;

  // Local state for UI inputs (Desktop sidebar)
  const [priceInput, setPriceInput] = useState(queryPrice || 3000);
  const [sortInput, setSortInput] = useState(querySort);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const debouncedPrice = useDebounce(priceInput, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const productPerPage = 12; // Controlled by backend limit

  // 1. TanStack Query Hook (Pass URL filters to Backend)
  const { data: responseData, isLoading, isFetching } = useProducts({
    page: currentPage,
    search: querySearch,
    maxPrice: debouncedPrice,
    sort: sortInput,
    filter: queryFilter
  });

  const products = responseData?.candles || [];
  const totalPages = responseData?.totalPages || 0;
  const currentProducts = products; // No need to slice, backend does it!

  // Reset page when URL filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [querySearch, queryPrice, querySort]);

  // Sync Debounced Price to URL (Auto Trigger)
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (debouncedPrice && debouncedPrice < 3000) {
      newParams.set("maxPrice", debouncedPrice);
    } else {
      newParams.delete("maxPrice");
    }
    setSearchParams(newParams);
  }, [debouncedPrice, searchParams, setSearchParams]);

  // Sync Sort to URL (Auto Trigger)
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (sortInput && sortInput !== "latest") {
      newParams.set("sort", sortInput);
    } else {
      newParams.delete("sort");
    }
    setSearchParams(newParams);
  }, [sortInput, searchParams, setSearchParams]);

  const indexOfFirstProduct = (currentPage - 1) * productPerPage;
  const indexOfLastProduct = indexOfFirstProduct + products.length;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Handle Mobile Modal Apply
  const handleMobileApply = ({ sort, maxPrice }) => {
    const newParams = new URLSearchParams(searchParams);
    if (sort && sort !== "latest") newParams.set("sort", sort);
    else newParams.delete("sort");

    if (maxPrice && maxPrice < 3000) newParams.set("maxPrice", maxPrice);
    else newParams.delete("maxPrice");

    setSearchParams(newParams);
    // Also sync desktop local state just in case it's resized
    setSortInput(sort || "latest");
    setPriceInput(maxPrice || 3000);
  };

  const sortOptions = [
    { value: 'latest', label: 'Sort by latest' },
    { value: 'popularity', label: 'Sort by Popularity' },
    { value: 'low-to-high', label: 'Sort by Low to High' },
    { value: 'high-to-low', label: 'Sort by High to Low' },
  ];

  const sidebarRef = useRef();
  const mainRef = useRef();

  // ✅ GSAP animations (Unchanged, scoped to refs)
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
            start: "top 95%",
            toggleActions: "play none none reverse",
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
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, sidebarRef);
    return () => ctx.revert();
  }, []);

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
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(q(".product-grid > *"), {
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: mainRef.current,
          start: "top 95%",
          toggleActions: "play none none reverse",
        },
      });
    }, mainRef);
    return () => ctx.revert();
  }, [currentProducts, isLoading]);

  return (
    <>
      <SEO
        title="Shop All Candles | Naisha Creations"
        description="Shop our full range of luxury scented candles. Hand-poured with eco-friendly soy wax and premium fragrance oils."
      />
      <PageBanner title="Candles" currentPage="Candles" />
      <div className="bg-bg-canvas min-h-screen">
        <div className="container mx-auto px-4 py-[8%]">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* sidebar */}
            <aside
              ref={sidebarRef}
              className="w-full lg:w-1/4 space-y-8 order-2 lg:order-1"
            >
              {/* Price filter (Desktop only) */}
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
                    <span>{priceInput < 3000 ? `Max: ₹${priceInput}` : "No Max"}</span>
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

            {/* Main Content */}
            <main ref={mainRef} className="w-full lg:w-3/4 order-1 lg:order-2">
              <div className="flex justify-between items-center mb-8 gap-4 top-bar">
                <p className="text-text-muted italic">
                  Showing {products.length > 0 ? indexOfFirstProduct + 1 : 0}-
                  {indexOfLastProduct} of{" "}
                  {responseData?.total || 0} results
                </p>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-bg-surface border border-bg-muted px-4 py-2 rounded-md shadow-sm text-text-base font-medium hover:bg-bg-surface-hover transition-colors"
                >
                  <Filter size={18} />
                  Filters
                </button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10 product-grid">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <ProductCardSkeleton key={idx} />
                  ))}
                </div>
              ) : currentProducts.length > 0 ? (
                <div className="relative">
                  {/* Non-blocking inline spinner */}
                  {isFetching && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary bg-bg-surface p-1 shadow-lg rounded-full"></div>
                    </div>
                  )}

                  {/* Grid with opacity transition */}
                  <div className={`grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10 product-grid transition-opacity duration-300 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    {currentProducts.map((item) => (
                      <ProductCard key={item._id} product={item} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-2 pagination">
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          className={`w-10 h-10 border rounded-sm transition-all cursor-pointer ${currentPage === index + 1
                              ? "bg-brand-primary text-text-on-brand border-brand-primary"
                              : "bg-bg-surface text-text-muted hover:border-brand-primary hover:text-brand-primary"
                            }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-bg-surface rounded-xl shadow-sm border border-bg-muted empty-state">
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
