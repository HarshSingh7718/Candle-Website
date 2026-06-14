import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
// 👉 Import the TanStack hooks
import { useGetCategories, useDeleteCategory, useToggleCategoryStatus } from '../hooks/useCategories';

import { Plus, Image, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const Categories = () => {
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const cardsRef = useRef([]);

  // 👉 Hook up TanStack Query
  const { data: categories = [], isLoading, isFetching } = useGetCategories();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: toggleStatus } = useToggleCategoryStatus();

  // Pagination logic
  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPages = Math.ceil(categories.length / limit);
  const currentCategories = categories.slice((page - 1) * limit, page * limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
  }, []);

  useEffect(() => {
    if (cardsRef.current.length > 0 && !isLoading) {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.3 }
      );
    }
  }, [categories, isLoading]);

  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };



  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full space-y-stack-lg opacity-0">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-stack-sm">
        <div>
          <h2 className="font-heading text-headline-lg text-text-base">Product Categories</h2>
          <p className="font-body-md text-body-md text-text-muted mt-2">Manage and organize your artisanal collections.</p>
        </div>
        <button
          onClick={() => navigate('/categories/add')}
          className="bg-brand-primary hover:bg-coffee-800 text-text-on-brand font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 border-b-2 border-coffee-800 active:border-b-0 active:translate-y-px cursor-pointer"
        >
          <Plus className=" text-[18px]" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <article key={`skeleton-${idx}`} className="bg-bg-surface border border-bg-muted/30 rounded-xl overflow-hidden shadow-sm animate-pulse flex flex-col">
              <div className="h-48 relative bg-bg-muted"></div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-stack-md">
                <div>
                  <div className="h-4 bg-bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-bg-muted rounded w-3/4"></div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-bg-muted/20 mt-4">
                  <div className="h-6 w-16 bg-bg-muted rounded-full"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-bg-muted rounded-full"></div>
                    <div className="h-8 w-8 bg-bg-muted rounded-full"></div>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : currentCategories.map(category => (
          <article
            key={category._id} // 👉 MongoDB _id
            ref={addToCardsRef}
            className={`bg-bg-surface border border-bg-muted/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col group ${!category.isActive ? 'opacity-75' : ''}`}
          >
            <div
              onClick={() => navigate(`/categories/${category._id}/products`)}
              className={`h-48 relative bg-bg-canvas overflow-hidden cursor-pointer ${!category.isActive ? 'grayscale-[50%]' : ''}`}
            >
              {/* 👉 Use backend image.url */}
              {category.image?.url ? (
                <img alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={category.image.url} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Image className=" text-4xl text-text-muted opacity-50" /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="font-heading text-headline-md text-text-on-brand">{category.name}</h3>
                <p className="text-text-on-brand/70 text-xs mt-1 font-label-sm">Click to manage products →</p>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-stack-md">
              <p className="font-body-md text-body-md text-text-muted line-clamp-2">{category.description || "No description provided."}</p>

              <div className="flex items-center justify-between pt-4 border-t border-bg-muted/20">
                {/* Toggle */}
                <label className="flex items-center cursor-pointer gap-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={category.isActive}
                      onChange={() => toggleStatus(category._id)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${category.isActive ? 'bg-brand-primary' : 'bg-bg-muted'}`}></div>
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-transform duration-300 ${category.isActive ? 'bg-text-on-brand left-1 translate-x-4' : 'bg-bg-surface left-1'}`}></div>
                  </div>
                  <span className="font-label-sm text-label-sm text-text-muted">{category.isActive ? 'Active' : 'Hidden'}</span>
                </label>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/categories/edit/${category._id}`)}
                    className="p-2 text-text-muted hover:text-brand-primary hover:bg-bg-canvas rounded-full transition-colors cursor-pointer"
                  >
                    <Pencil className=" text-[20px]" />
                  </button>
                  <button
                    onClick={() => deleteCategory(category._id)}
                    className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-colors cursor-pointer"
                  >
                    <Trash2 className=" text-[20px]" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {categories.length === 0 && !isLoading && (
          <div className="col-span-full py-12 text-center text-text-muted font-body-md">
            No categories found. Add one to get started.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 flex items-center justify-between bg-bg-surface rounded-xl border border-bg-muted/30">
          <span className="text-sm text-text-muted">
            Showing page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded border border-bg-muted text-text-muted hover:bg-bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className=" text-[18px]" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 rounded border text-sm font-medium transition-colors ${
                  pageNum === page
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'border-bg-muted text-text-muted hover:bg-bg-surface-hover'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded border border-bg-muted text-text-muted hover:bg-bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className=" text-[18px]" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Categories;