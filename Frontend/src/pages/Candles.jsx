import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronDown, Filter } from "lucide-react";

import ProductCard from "../components/ui/Cards/ProductCard";
import SEO from "../components/SEO";
import PageBanner from "../components/ui/PageBanner";
import { useProducts } from "../hooks/useProducts";
import { useDebounce } from "../hooks/useDebounce";

gsap.registerPlugin(ScrollTrigger);

const Candles = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || "";
  const queryPrice = searchParams.get("maxPrice") || null;
  const querySort = searchParams.get("sort") || "latest";

  // Local state for UI inputs
  const [searchInput, setSearchInput] = useState(querySearch);
  const [priceInput, setPriceInput] = useState(queryPrice || 3000);
  const [sortInput, setSortInput] = useState(querySort);

  const debouncedPrice = useDebounce(priceInput, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const productPerPage = 8; // Controlled by backend limit

  // 1. TanStack Query Hook (Pass URL filters to Backend)
  const { data: responseData, isLoading, isFetching } = useProducts({
    page: currentPage,
    search: querySearch,
    maxPrice: queryPrice,
    sort: querySort
  });

  const products = responseData?.candles || [];
  const totalPages = responseData?.totalPages || 0;
  const currentProducts = products; // No need to slice, backend does it!

  // Reset page when URL filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [querySearch, queryPrice, querySort]);

  // Sync Search Input local state if URL changes externally
  useEffect(() => {
    setSearchInput(querySearch);
  }, [querySearch]);

  // Handle Search Commit (Manual Trigger)
  const handleSearchCommit = () => {
    const newParams = new URLSearchParams(searchParams);
    if (searchInput) newParams.set("search", searchInput);
    else newParams.delete("search");
    setSearchParams(newParams);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearchCommit();
  };

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
            start: "top 85%",
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
            start: "top 85%",
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
          trigger: q(".top-bar"),
          start: "top 85%",
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
          trigger: q(".product-grid"),
          start: "top 85%",
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
              {/* Search */}
              <div className="bg-bg-surface p-6 rounded-sm shadow-sm sidebar-box">
                <h3 className="text-xl font-medium mb-4 sidebar-title text-text-base">
                  Search
                </h3>
                <div className="relative sidebar-content flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchInput}
                      placeholder="Search Products..."
                      className="w-full border border-bg-muted p-2 pl-10 rounded-md outline-none focus:border-brand-primary bg-bg-surface-hover text-text-base"
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                    />
                    <Search
                      className="absolute left-3 top-2.5 text-text-muted"
                      size={18}
                    />
                  </div>
                  <button 
                    onClick={handleSearchCommit}
                    className="bg-brand-primary text-text-on-brand p-2 rounded-md hover:bg-brand-secondary transition-colors cursor-pointer"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </div>

              {/* Price filter */}
              <div className="bg-bg-surface p-6 rounded-sm shadow-sm hidden md:block sidebar-box">
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

                  <div className="relative group mt-6">
                    <select
                      className="w-full appearance-none bg-bg-surface-hover border border-bg-muted px-4 py-2.5 pr-10 rounded-md shadow-sm outline-none cursor-pointer focus:ring-2 ring-brand-primary/20 text-text-base"
                      onChange={(e) => setSortInput(e.target.value)}
                      value={sortInput}
                    >
                      <option value="latest">Sort by latest</option>
                      <option value="popularity">Sort by Popularity</option>
                      <option value="low-to-high">Sort by Low to High</option>
                      <option value="high-to-low">Sort by High to Low</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none w-4 h-4" />
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main ref={mainRef} className="w-full lg:w-3/4 order-1 lg:order-2">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 top-bar">
                <p className="text-text-muted italic">
                  Showing {products.length > 0 ? indexOfFirstProduct + 1 : 0}-
                  {indexOfLastProduct} of{" "}
                  {responseData?.total || 0} results
                </p>
                <div className="relative group block md:hidden">
                  <select
                    className="appearance-none bg-bg-surface-hover border border-bg-muted px-6 py-2 pr-10 rounded shadow-sm outline-none cursor-pointer focus:ring-2 ring-brand-primary/20 text-text-base"
                    onChange={(e) => setSortInput(e.target.value)}
                    value={sortInput}
                  >
                    <option value="latest">Sort by latest</option>
                    <option value="popularity">Sort by Popularity</option>
                    <option value="low-to-high">Sort by Low to High</option>
                    <option value="high-to-low">Sort by High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-text-muted pointer-events-none" />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
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
                          className={`w-10 h-10 border rounded-sm transition-all cursor-pointer ${
                            currentPage === index + 1
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
    </>
  );
};

export default Candles;
