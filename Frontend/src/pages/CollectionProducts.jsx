import React, { useRef, useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useParams } from "react-router-dom";
import { Search, ChevronDown, Filter } from "lucide-react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";

import API from "../api";
import ProductCard from "../components/ui/Cards/ProductCard";
import PageBanner from "../components/ui/PageBanner";
import Loader from "../components/ui/Loader";
import { useProductsByCategory } from "../hooks/useProducts";

gsap.registerPlugin(ScrollTrigger);

const CollectionProducts = () => {
  const { categoryName } = useParams();
  const sidebarRef = useRef();
  const mainRef = useRef();

  // 1. UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [priceRange, setPriceRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productPerPage = 8;

  // 3. Fetch specific products using category slug from URL
  const { data: responseData, isLoading } =
    useProductsByCategory(categoryName, {
      page: currentPage,
      search: searchTerm,
      sort: sortOption,
      maxPrice: priceRange
    });

  const categoryProducts = responseData?.products || [];
  const totalPages = responseData?.totalPages || 0;
  const currentProducts = categoryProducts; // Backend handles slicing now!

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption, priceRange]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

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
          start: "top 85%",
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
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, mainRef);
    return () => ctx.revert();
  }, [currentProducts, isLoading]);

  if (isLoading || !categoryName) return <Loader />;

  const collectionDisplayName =
    categoryProducts[0]?.category?.name || categoryName.replace(/-/g, " ");

  return (
    <>
      <PageBanner
        title={collectionDisplayName}
        currentPage={collectionDisplayName}
      />
      <div className="bg-[#fcfaf5]">
        <div className="container mx-auto px-4 py-[8%]">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside
              ref={sidebarRef}
              className="w-full lg:w-1/4 space-y-8 order-2 lg:order-1"
            >
              <div className="bg-white p-6 rounded-sm shadow-sm sidebar-box border border-stone-100">
                <h3 className="text-xl font-medium mb-4 sidebar-title">
                  Search
                </h3>
                <div className="relative sidebar-content">
                  <input
                    type="text"
                    placeholder="Search in collection..."
                    className="w-full border border-stone-200 p-2 pl-10 rounded-md outline-none focus:border-primary transition-colors"
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <Search
                    className="absolute left-3 top-2.5 text-stone-400"
                    size={18}
                  />
                </div>
              </div>

              <div className="bg-white hidden md:block p-6 rounded-sm shadow-sm sidebar-box border border-stone-100">
                <h3 className="text-xl font-medium mb-4 sidebar-title flex justify-between items-center">
                  Price Filter
                  {priceRange !== null && (
                    <button
                      onClick={() => setPriceRange(null)}
                      className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded cursor-pointer hover:bg-red-200 transition-colors"
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
                    // 👉 Default to 5000 if null so the slider doesn't look empty
                    value={priceRange || 5000}
                    onChange={(e) => {
                      setPriceRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-sm mt-2 font-medium text-stone-600">
                    <span>₹0</span>
                    {/* 👉 Only show price text if a filter is actually applied */}
                    <span>{priceRange ? `Max: ₹${priceRange}` : "No Max"}</span>
                  </div>
                  <div className="relative group mt-6">
                    <select
                      className="w-full appearance-none bg-white border border-stone-200 px-4 py-2.5 pr-10 rounded-md shadow-sm outline-none cursor-pointer focus:ring-1 ring-primary/20"
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="latest">Sort by latest</option>
                      <option value="popularity">Sort by Popularity</option>
                      <option value="low-to-high">Sort by Low to High</option>
                      <option value="high-to-low">Sort by High to Low</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none w-4 h-4" />
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Grid */}
            <main ref={mainRef} className="w-full lg:w-3/4 order-1 lg:order-2">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 top-bar">
                <p className="text-stone-500 italic">
                  Showing{" "}
                  {categoryProducts.length > 0
                    ? (currentPage - 1) * productPerPage + 1
                    : 0}
                  -
                  {((currentPage - 1) * productPerPage) + categoryProducts.length}{" "}
                  of {responseData?.totalProducts || 0} results
                </p>
              </div>

              {currentProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10 product-grid">
                    {currentProducts.map((item) => (
                      <ProductCard key={item._id} product={item} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-2 pagination">
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          className={`w-10 h-10 border rounded-sm transition-all cursor-pointer font-medium ${
                            currentPage === index + 1
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-stone-600 border-stone-200 hover:border-primary hover:text-primary"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-lg border border-dashed border-stone-200 empty-state">
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
    </>
  );
};

export default CollectionProducts;
