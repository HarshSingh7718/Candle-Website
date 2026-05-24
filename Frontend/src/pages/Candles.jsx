import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronDown, Filter } from "lucide-react";
import { Icon } from "@iconify/react";

import ProductCard from "../components/ui/Cards/ProductCard";
import PageBanner from "../components/ui/PageBanner";
import Loader from "../components/ui/Loader";
import { useProducts } from "../hooks/useProducts"; // Updated hook

gsap.registerPlugin(ScrollTrigger);

const Candles = () => {
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("latest");
  const [priceRange, setPriceRange] = useState(null); // Updated to match Rupee scale
  const [selectedTag, setSelectedTag] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const productPerPage = 8; // Controlled by backend limit

  // 1. TanStack Query Hook (Pass filters to Backend)
  const { data: responseData, isLoading } = useProducts({
    page: currentPage,
    search: searchTerm,
    maxPrice: priceRange,
    sort: sortOption
  });

  const products = responseData?.candles || [];
  const totalPages = responseData?.totalPages || 0;
  const currentProducts = products; // No need to slice, backend does it!

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption, priceRange]);

  // Sync search term from URL
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

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

  if (isLoading) return <Loader />;

  return (
    <>
      <PageBanner title="Candles" currentPage="Candles" />
      <div className="bg-light-yellow">
        <div className="container mx-auto px-4 py-[8%]">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* sidebar */}
            <aside
              ref={sidebarRef}
              className="w-full lg:w-1/4 space-y-8 order-2 lg:order-1"
            >
              {/* Search */}
              <div className="bg-white p-6 rounded-sm shadow-sm sidebar-box">
                <h3 className="text-xl font-medium mb-4 sidebar-title">
                  Search
                </h3>
                <div className="relative sidebar-content">
                  <input
                    type="text"
                    value={searchTerm}
                    placeholder="Search Products..."
                    className="w-full border p-2 pl-10 rounded-md outline-none focus:border-primary"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                </div>
              </div>

              {/* Price filter */}
              <div className="bg-white p-6 rounded-sm shadow-sm hidden md:block sidebar-box">
                <h3 className="text-xl font-medium mb-4 sidebar-title flex justify-between items-center">
                  Filter By Price
                  {priceRange !== null && (
                    <button
                      onClick={() => setPriceRange(null)}
                      className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded cursor-pointer hover:bg-red-200"
                    >
                      Reset
                    </button>
                  )}
                </h3>

                <div className="sidebar-content">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    // 👉 Default to 5000 if null, so the slider doesn't jump
                    value={priceRange || 5000}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-sm mt-2 font-medium">
                    <span>₹0</span>
                    {/* 👉 Only show the price if a filter is active */}
                    <span>{priceRange ? `Max: ₹${priceRange}` : "No Max"}</span>
                  </div>

                  <div className="relative group mt-6">
                    <select
                      className="w-full appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-10 rounded-md shadow-sm outline-none cursor-pointer focus:ring-2 ring-teal-500/20"
                      onChange={(e) => setSortOption(e.target.value)}
                      value={sortOption}
                    >
                      <option value="latest">Sort by latest</option>
                      <option value="popularity">Sort by Popularity</option>
                      <option value="low-to-high">Sort by Low to High</option>
                      <option value="high-to-low">Sort by High to Low</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main ref={mainRef} className="w-full lg:w-3/4 order-1 lg:order-2">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 top-bar">
                <p className="text-gray-500 italic">
                  Showing {products.length > 0 ? indexOfFirstProduct + 1 : 0}-
                  {indexOfLastProduct} of{" "}
                  {responseData?.total || 0} results
                </p>
                <div className="relative group block md:hidden">
                  <select
                    className="appearance-none bg-white border px-6 py-2 pr-10 rounded shadow-sm outline-none cursor-pointer focus:ring-2 ring-teal-500/20"
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="latest">Sort by latest</option>
                    <option value="popularity">Sort by Popularity</option>
                    <option value="low-to-high">Sort by Low to High</option>
                    <option value="high-to-low">Sort by High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {currentProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10 product-grid">
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
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-gray-600 hover:border-primary hover:text-primary"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-inner empty-state">
                  <Filter className="mx-auto text-gray-300 mb-4" size={48} />
                  <h3 className="text-xl font-medium text-gray-500">
                    No Product match your filters.
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
