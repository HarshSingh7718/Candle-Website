import React, { useRef, useEffect, useState } from 'react'
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import ProductCard from '../components/ui/Cards/ProductCard';
import ProductData from "../assets/Data/ProductData.json"
import { Search, ChevronDown, Filter } from 'lucide-react';
import PageBanner from '../components/ui/PageBanner';
import { Icon } from '@iconify/react';

gsap.registerPlugin(ScrollTrigger);

gsap.registerPlugin(ScrollTrigger);

const Candles = () => {
    const [products, setProducts] = useState(ProductData);
const [searchTerm, setSearchTerm] = useState("");
const [selectedCategory, setSelectedCategory] = useState("All");
const [sortOption, setSortOption] = useState("latest");
const [priceRange, setPriceRange] = useState(300)
const [selectedTag, setSelectedTag] = useState("All");

// Pagination State
const [currentPage, setCurrentPage] = useState(1);
const productPerPage = 9;

const tags = ["All", "Discount", "Item", "Simple", "Smart", "Stock"];

// Extract unique categories
const allCategories = ["All", ...new Set(ProductData.flatMap(p => p.categories.split(',')))];

useEffect(() => {
    let filtered = ProductData.filter((product) => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || product.categories.includes(selectedCategory);
        const matchesPrice = product.price <= priceRange;

        const matchesTag = selectedTag === "All" || product.categories.includes(selectedTag);

        return matchesSearch && matchesCategory && matchesPrice && matchesTag;

    });

if (sortOption === "low-to-high") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "high-to-low") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === "popularity") {
        filtered.sort((a, b) => b.idprice - a.id);
    }

    setProducts(filtered);
    setCurrentPage(1); // Reset to page 1 when filters chnage
}, [searchTerm, selectedCategory, sortOption, priceRange, selectedTag]);

const indexOfLastProduct = currentPage * productPerPage;
const indexOfFirstProduct = indexOfLastProduct - productPerPage;
const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
const totalPages = Math.ceil(products.length / productPerPage);

const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: 'smooth' }); // Scroll to top of grid
};
const sidebarRef = useRef();
const mainRef = useRef();

useEffect(() => {
    if (!sidebarRef.current) return;

    // Pass sidebarRef as the scope to gsap.context
    const ctx = gsap.context(() => {
        const q = gsap.utils.selector(sidebarRef);
        const boxes = q(".sidebar-box");

        boxes.forEach((box) => {
            const title = box.querySelector(".sidebar-title");
            const content = box.querySelector(".sidebar-content");

            // Animation for Title
            gsap.from(title, {
                x: 30,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: box,
                    start: "top 85%",
                    toggleActions: 'play none none reverse'
                },
            });
            
            // Animation for Content
            gsap.from(content, {
                y: 30,
                opacity: 0,
                duration: 0.6,
                delay: 0.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: box,
                    start: "top 85%",
                    toggleActions: 'play none none reverse'
                },
            });
        }); // Added missing closing brace for forEach

    }, sidebarRef); // Scope assigned here

    return () => ctx.revert(); // Properly cleans up all animations and ScrollTriggers
}, []);

useEffect(() => {
    if (!mainRef.current) return;

    // Pass sidebarRef as the scope to gsap.context
    const ctx = gsap.context(() => {
        const q = gsap.utils.selector(mainRef);
        
 gsap.from(q(".top-bar") ,{
                y: -40,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: q(".top-bar"),
                    start: "top 85%",
                    toggleActions: 'play none none reverse'
                },
            });
             gsap.from(q(".product-grid > *") ,{
                y: 60,
                opacity: 0,
                duration: 0.7,
                stagger:0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: q(".product-grid"),
                    start: "top 85%",
                    toggleActions: 'play none none reverse'
                },
            });

             gsap.from(q(".pagination") ,{
                y: 40,
                opacity: 0,
                duration: 0.6,
                delay:0.2,
                stagger:0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: q(".pagination"),
                    start: "top 90%",
                    toggleActions: 'play none none reverse'
                },
            });

                 gsap.from(q(".empty-state") ,{
              scale:0.9,
                opacity: 0,
                duration: 0.6,
                
               
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: q(".empty-state"),
                    start: "top 85%",
                    toggleActions: 'play none none reverse'
                },
            });
   

    }, mainRef); // Scope assigned here

    return () => ctx.revert(); // Properly cleans up all animations and ScrollTriggers
}, [currentProducts]);
    return (
        <>
            <PageBanner
                title="Shop"
                currentPage="Shop"
            />
          <div className="bg-light-yellow">
    <div className="container mx-auto px-4 py-[8%]">
        <div className="flex flex-col lg:flex-row gap-8">

            {/* Main Content */}
            <main ref={mainRef} className='w-full lg:w-3/4 order-1 lg:order-2'>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 top-bar">
                    <p className='text-gray-500 italic'>
                        Showing {products.length > 0 ? indexOfFirstProduct + 1 : 0}-{Math.min
                        (indexOfLastProduct, products.length)} of {products.length} results
                    </p>
                    <div className="relative group">
    <select
        className='appearance-none bg-white border px-6 py-2 pr-10 rounded shadow-sm outline-none cursor-pointer focus:ring-2 ring-teal-500/20'
        onChange={(e) => setSortOption(e.target.value)}
    >
        <option value="latest">Sort by latest</option>
        <option value="popularity">Sort by Popularity</option>
        <option value="low-to-high">Sort by Low to High</option>
        <option value="high-to-low">Sort by High to Low</option>
    </select>
    <ChevronDown className='absolute right-3 top-3 text-gray-400 pointer-events-none' />
</div>
                </div>
                {/* Product Grid */}
{currentProducts.length > 0 ? (
    <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10 product-grid">
            {currentProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
            ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-2 pagination">
                <button
    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
    disabled={currentPage === 1}
    className='p-2 border rounded-sm hover:bg-primary hover:text-white
    disabled:opacity-30 transition-all cursor-pointer'
>
    <Icon icon="mdi:chevron-left" width="24" />
</button>

{[...Array(totalPages)].map((_, index) => (
    <button
        key={index + 1}
        onClick={() => handlePageChange(index + 1)}
        className={`w-10 h-10 border rounded-sm transition-all
        cursor-pointer ${currentPage === index + 1 ? "bg-primary text-white border-primary" : "bg-white text-gray-600 hover:border-primary hover:text-primary"}`}
    >
     {index+1}
    </button>
))}

<button
    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
    disabled={currentPage === totalPages}
    className='p-2 border rounded-sm hover:bg-primary hover:text-white
    disabled:opacity-30 transition-all cursor-pointer'
>
    <Icon icon="mdi:chevron-right" width="24" />
</button>

            </div>
        )}
    </>
) : (
    <div className="text-center py-20 bg-white rounded-xl shadow-inner empty-state">
    <Filter className='mx-auto text-gray-300 mb-4' size={48} />
    <h3 className='text-xl font-medium text-gray-500'>No Product match your filters.</h3>
</div>
)}
            </main>
            {/* sidebar */}

<aside ref={sidebarRef} className='w-full lg:w-1/4 space-y-8 order-2 lg:order-1'>
    {/* Search */}
    <div className="bg-white p-6 rounded-sm shadow-sm sidebar-box">
        <h3 className='text-xl font-medium mb-4 sidebar-title'>Search</h3>
        <div className="relative sidebar-content">
            <input
                type="text"
                placeholder='Search Products...'
                className='w-full border p-2 pl-10 rounded-md outline-none focus:border-primary'
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
        </div>
    </div>
    {/* Categories */}
{/* <div className="bg-white p-6 rounded-sm shadow-sm sidebar-box">
    <h3 className='text-xl font-medium mb-4 sidebar-title'>Categories</h3>
    <ul className='space-y-2 sidebar-content'>
        {allCategories.map(cat => (
            <li
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer transition-colors ${selectedCategory === cat ? 
                "text-primary font-bold" : "text-gray-600 hover:text-black"}`}
            >
                {cat}
            </li>
        ))}
    </ul>
</div> */}
{/* price filter */}
<div className="bg-white p-6 rounded-sm shadow-sm sidebar-box">
    <h3 className='text-xl font-medium mb-4 sidebar-title'>Filter By Price</h3>
    <div className="sidebar-content">
        <input
            type="range"
            min="0"
            max="300"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className='w-full accent-primary'
        />
        <div className="flex justify-between text-sm mt-2 font-medium">
            <span>$0</span>
<span>Max: ${priceRange}</span>
        </div>
    </div>
</div>

</aside>
        </div>
    </div>
</div>
        </>
    )
}



export default Candles