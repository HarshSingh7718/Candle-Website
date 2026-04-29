import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronDown, Filter } from "lucide-react";
import { Icon } from "@iconify/react";

import ProductCard from "../components/ui/Cards/ProductCard";
import PageBanner from "../components/ui/PageBanner";
import { useProducts } from "../hooks/useProducts"; // Updated hook

gsap.registerPlugin(ScrollTrigger);

const Candles = () => {
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || "";
  
  // 1. TanStack Query Hook
  const { data: allProducts = [], isLoading } = useProducts();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("latest");
  const [priceRange, setPriceRange] = useState(3000); // Updated to match Rupee scale
  const [selectedTag, setSelectedTag] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const productPerPage = 8;

  const tags = ["All", "Discount", "Simple", "Signature", "Seasonal"];

  // Sync search term from URL
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  // 2. Logic: Filtering & Sorting (Now using backend data)
  useEffect(() => {
    if (!allProducts) return;

    let filtered = allProducts.filter((product) => {
      const matchesSearch = product.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      // Match category name from the backend category object
      const matchesCategory =
        selectedCategory === "All" ||
        product.category?.name === selectedCategory;

      const currentPrice = product.discountPrice || product.price;
      const matchesPrice = currentPrice <= priceRange;

      // Handle tags (logic depends on your backend schema, usually isFeatured or type)
      const matchesTag =
        selectedTag === "All" || 
        (selectedTag === "Discount" && product.discountPrice > 0) ||
        product.type === selectedTag.toLowerCase();

      return matchesSearch && matchesCategory && matchesPrice && matchesTag;
    });

    // Sorting Logic
    if (sortOption === "low-to-high") {
      filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortOption === "high-to-low") {
      filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortOption === "popularity") {
      filtered.sort((a, b) => b.ratings - a.ratings);
    } else if (sortOption === "latest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setProducts(filtered);
    setCurrentPage(1);
  }, [allProducts, searchTerm, selectedCategory, sortOption, priceRange, selectedTag]);

  const indexOfLastProduct = currentPage * productPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productPerPage);

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
          x: 30, opacity: 0, duration: 0.6, ease: "power3.out",
          scrollTrigger: { trigger: box, start: "top 85%", toggleActions: "play none none reverse" },
        });
        gsap.from(box.querySelector(".sidebar-content"), {
          y: 30, opacity: 0, duration: 0.6, delay: 0.2, ease: "power3.out",
          scrollTrigger: { trigger: box, start: "top 85%", toggleActions: "play none none reverse" },
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
        y: -40, opacity: 0, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: q(".top-bar"), start: "top 85%", toggleActions: "play none none reverse" },
      });
      gsap.from(q(".product-grid > *"), {
        y: 60, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: q(".product-grid"), start: "top 85%", toggleActions: "play none none reverse" },
      });
    }, mainRef);
    return () => ctx.revert();
  }, [currentProducts, isLoading]);

  if (isLoading) return <div className="py-20 text-center font-serif italic">Loading Collection...</div>;

  return (
    <>
      <PageBanner title="Candles" currentPage="Candles" />
      <div className="bg-light-yellow">
        <div className="container mx-auto px-4 py-[8%]">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* sidebar */}
            <aside ref={sidebarRef} className="w-full lg:w-1/4 space-y-8 order-2 lg:order-1">
              {/* Search */}
              <div className="bg-white p-6 rounded-sm shadow-sm sidebar-box">
                <h3 className="text-xl font-medium mb-4 sidebar-title">Search</h3>
                <div className="relative sidebar-content">
                  <input
                    type="text"
                    value={searchTerm}
                    placeholder="Search Products..."
                    className="w-full border p-2 pl-10 rounded-md outline-none focus:border-primary"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
              </div>

              {/* Price filter */}
              <div className="bg-white hidden md:block p-6 rounded-sm shadow-sm sidebar-box">
                <h3 className="text-xl font-medium mb-4 sidebar-title">Filter By Price</h3>
                <div className="sidebar-content">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-sm mt-2 font-medium">
                    <span>₹0</span>
                    <span>Max: ₹{priceRange}</span>
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
                  {Math.min(indexOfLastProduct, products.length)} of {products.length} results
                </p>
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
                  <h3 className="text-xl font-medium text-gray-500">No Product match your filters.</h3>
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