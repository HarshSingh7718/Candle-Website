import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
// 👉 Import the TanStack hooks
import { useGetCategories, useDeleteCategory, useToggleCategoryStatus } from '../hooks/useCategories';

const Categories = () => {
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const cardsRef = useRef([]);

  // 👉 Hook up TanStack Query
  const { data: categories = [], isLoading } = useGetCategories();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: toggleStatus } = useToggleCategoryStatus();

  useEffect(() => {
    if (isLoading) return;

    gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });

    if (cardsRef.current.length > 0) {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.3 }
      );
    }
  }, [categories.length, isLoading]);

  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full space-y-stack-lg opacity-0">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-stack-sm">
        <div>
          <h2 className="font-heading text-headline-lg text-on-surface">Product Categories</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Manage and organize your artisanal collections.</p>
        </div>
        <button
          onClick={() => navigate('/categories/add')}
          className="bg-primary hover:bg-surface-tint text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 border-b-2 border-primary-fixed-dim active:border-b-0 active:translate-y-px cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {categories.map(category => (
          <article
            key={category._id} // 👉 MongoDB _id
            ref={addToCardsRef}
            className={`bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col group ${!category.isActive ? 'opacity-75' : ''}`}
          >
            <div className={`h-48 relative bg-surface-container-low overflow-hidden ${!category.isActive ? 'grayscale-[50%]' : ''}`}>
              {/* 👉 Use backend image.url */}
              {category.image?.url ? (
                <img alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={category.image.url} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50">image</span></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="font-heading text-headline-md text-on-primary">{category.name}</h3>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-stack-md">
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">{category.description || "No description provided."}</p>

              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                {/* Toggle */}
                <label className="flex items-center cursor-pointer gap-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={category.isActive}
                      onChange={() => toggleStatus(category._id)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${category.isActive ? 'bg-primary' : 'bg-surface-dim'}`}></div>
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-transform duration-300 ${category.isActive ? 'bg-on-primary left-1 translate-x-4' : 'bg-surface-container-lowest left-1'}`}></div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{category.isActive ? 'Active' : 'Hidden'}</span>
                </label>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/categories/edit/${category._id}`)}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-full transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button
                    onClick={() => deleteCategory(category._id)}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/50 rounded-full transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {categories.length === 0 && !isLoading && (
          <div className="col-span-full py-12 text-center text-on-surface-variant font-body-md">
            No categories found. Add one to get started.
          </div>
        )}
      </div>
    </main>
  );
};

export default Categories;