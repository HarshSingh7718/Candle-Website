import React, { useRef, useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useParams, useSearchParams } from "react-router-dom";
import { Search, ChevronDown, Filter, Loader2 } from "lucide-react";
import SEO from '../components/SEO';

import ProductCard from "../components/ui/Cards/ProductCard";
import PageBanner from "../components/ui/PageBanner";
import Loader from "../components/ui/Loader";
import MobileFilterModal from "../components/ui/MobileFilterModal";
import CustomDropdown from "../components/ui/CustomDropdown";
import { useProductsByCategory } from "../hooks/useProducts";
import { useDebounce } from "../hooks/useDebounce";
import ProductCardSkeleton from "../components/ui/Skeletons/ProductCardSkeleton";

gsap.registerPlugin(ScrollTrigger);

const CollectionProducts = () => {
  const { slug: categoryName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || "";
  const queryPrice = searchParams.get("maxPrice") || null;
  const querySort = searchParams.get("sort") || "latest";

  const sidebarRef = useRef();
  const mainRef = useRef();

  // Local UI State (Desktop sidebar)
  const [sortInput, setSortInput] = useState(querySort);
  const [priceInput, setPriceInput] = useState(queryPrice || 3000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productPerPage = 12;

  const debouncedPrice = useDebounce(priceInput, 500);

  // Fetch specific products using category slug from URL
  const { data: responseData, isLoading, isFetching } =
    useProductsByCategory(categoryName, {
      page: currentPage,
      search: querySearch,
      sort: querySort,
      maxPrice: queryPrice
    });

  const categoryProducts = responseData?.products || [];
  const totalPages = responseData?.totalPages || 0;
  const currentProducts = categoryProducts; // Backend handles slicing now!

  // Reset page when URL filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [querySearch, querySort, queryPrice]);

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
    setSortInput(sort || "latest");
    setPriceInput(maxPrice || 3000);
  };

  const sortOptions = [
    { value: 'latest', label: 'Sort by latest' },
    { value: 'popularity', label: 'Sort by Popularity' },
    { value: 'low-to-high', label: 'Sort by Low to High' },
    { value: 'high-to-low', label: 'Sort by High to Low' },
  ];

  // 5. GSAP Animations
  useEffect(() => {
    if (!sidebarRef.current || isLoading) return;
    const ctx = gsap.context(() => {
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
  }, [isLoading]);

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
          start: "top 95%",
          toggleActions: "play none none reverse",
        },
      });
      if (currentProducts.length > 0) {
        gsap.from(q(".product-grid > *"), {
          y: 60,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: q(".product-grid"),
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, mainRef);
    return () => ctx.revert();
  }, [currentProducts, isLoading]);

  if (!categoryName) return <Loader />;

  const collectionDisplayName =
    categoryProducts[0]?.category?.name || categoryName.replace(/-/g, " ");

  return (
    <>
      <PageBanner
        title={collectionDisplayName}
        currentPage={collectionDisplayName}
      />
      <SEO
        title={`${collectionDisplayName} | Naisha Creations`}
        description={`Discover our full range of ${collectionDisplayName} candles. Hand-poured with eco-friendly soy wax and premium fragrance oils.`}
        image={categoryProducts[0]?.images?.[0]?.url}
      />
      <div className="bg-[#fcfaf5]">
        <div className="container mx-auto px-4 py-[8%]">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside
              ref={sidebarRef}
              className="w-full lg:w-1/4 space-y-8 order-2 lg:order-1"
            >
              <div className="bg-bg-surface hidden lg:block p-6 rounded-sm shadow-sm sidebar-box border border-stone-100">
                <h3 className="text-xl font-medium mb-4 sidebar-title flex justify-between items-center">
                  Price Filter
                  {queryPrice !== null && (
                    <button
                      onClick={() => setPriceInput(3000)}
                      className="text-[10px] bg-red-100 text-danger px-2 py-1 rounded cursor-pointer hover:bg-red-200 transition-colors"
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
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-sm mt-2 font-medium text-stone-600">
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

            {/* Main Content Grid */}
            <main ref={mainRef} className="w-full lg:w-3/4 order-1 lg:order-2">
              <div className="flex justify-between items-center mb-8 gap-4 top-bar">
                <p className="text-stone-500 italic">
                  Showing{" "}
                  {categoryProducts.length > 0
                    ? (currentPage - 1) * productPerPage + 1
                    : 0}
                  -
                  {((currentPage - 1) * productPerPage) + categoryProducts.length}{" "}
                  of {responseData?.totalProducts || 0} results
                </p>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-bg-surface border border-stone-200 px-4 py-2 rounded-md shadow-sm text-stone-700 font-medium hover:bg-stone-50 transition-colors"
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
                <>
                  <div className="relative">
                    {isFetching && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 bg-bg-surface p-2 rounded-full shadow-lg">
                        <Loader2 className="animate-spin text-primary" size={24} />
                      </div>
                    )}
                    <div className={`grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10 product-grid transition-opacity duration-300 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                      {currentProducts.map((item) => (
                        <ProductCard key={item._id} product={item} />
                      ))}
                    </div>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-2 pagination">
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          className={`w-10 h-10 border rounded-sm transition-all cursor-pointer font-medium ${currentPage === index + 1
                            ? "bg-primary text-text-on-brand border-primary"
                            : "bg-bg-surface text-stone-600 border-stone-200 hover:border-primary hover:text-primary"
                            }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 bg-bg-surface rounded-lg border border-dashed border-stone-200 empty-state">
                  <Filter className="mx-auto text-stone-300 mb-4" size={48} />
                  <h3 className="text-xl font-medium text-stone-500 font-serif">
                    No candles match these filters.
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

export default CollectionProducts;
