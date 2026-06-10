import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
// 👉 Import our new hooks
import { useGetBanners, useDeleteBanner, useToggleBanner } from '../hooks/useBanners';

const Banners = () => {
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const cardsRef = useRef([]);

  // 👉 Hook up TanStack Query
  const { data: banners = [], isLoading, isFetching } = useGetBanners();
  const { mutate: deleteBanner } = useDeleteBanner();
  const { mutate: toggleStatus } = useToggleBanner();

  useEffect(() => {
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    if (cardsRef.current.length > 0 && !isLoading) {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
      );
    }
  }, [banners, isLoading]);

  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };



  return (
    <main className="flex-1 p-6 md:p-margin-page max-w-container-max mx-auto w-full opacity-0" ref={mainRef}>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-stack-lg">
        <div>
          <h2 className="font-heading text-headline-lg text-text-base mb-2">Banner Management</h2>
          <p className="font-body-md text-body-md text-text-muted max-w-2xl">
            Manage promotional banners and hero sections for the storefront. Ensure high-quality imagery aligns with the artisanal heritage theme.
          </p>
        </div>
        <button
          onClick={() => navigate('/banners/add')}
          className="shrink-0 bg-brand-primary hover:bg-coffee-800 text-text-on-brand font-label-md text-label-md py-3 px-6 rounded-lg shadow-sm shadow-orange-900/20 transition-all flex items-center justify-center gap-2 border-b-2 border-coffee-800 hover:border-brand-secondary cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Banner
        </button>
      </div>

      {/* Banner Cards Grid */}
      <div className={`grid grid-cols-1 xl:grid-cols-2 gap-gutter transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <article key={`skeleton-${idx}`} className="bg-bg-surface border border-bg-muted rounded-xl overflow-hidden flex flex-col shadow-sm animate-pulse">
              <div className="w-full h-48 sm:h-64 relative bg-bg-muted shrink-0 border-b border-bg-muted"></div>
              <div className="p-6 flex flex-col flex-1">
                <div className="h-6 bg-bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-bg-muted rounded w-3/4 mb-4"></div>
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-bg-muted border-dashed">
                  <div className="h-6 w-24 bg-bg-muted rounded-full"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-bg-muted rounded-lg"></div>
                    <div className="h-8 w-8 bg-bg-muted rounded-lg"></div>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : banners.map((banner) => {
          // 👉 Adapting to MongoDB data structure
          const isActive = banner.isActive; // Assuming backend uses a boolean

          return (
            <article
              key={banner._id} // 👉 Use MongoDB _id
              ref={addToCardsRef}
              className="bg-bg-surface border border-bg-muted rounded-xl overflow-hidden flex flex-col shadow-sm shadow-orange-900/5 group hover:shadow-md transition-shadow"
            >
              {/* Preview Area */}
              <div className="w-full h-48 sm:h-64 relative bg-bg-muted shrink-0 border-b border-bg-muted">
                <img
                  src={banner.desktopImage?.url} // 👉 Match backend image object
                  alt={banner.title}
                  className={`w-full h-full object-cover object-center absolute inset-0 transition-all duration-300 ${isActive ? '' : 'grayscale opacity-80'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className={`bg-bg-surface/90 backdrop-blur-sm font-label-sm text-label-sm px-2 py-1 rounded shadow-sm flex items-center gap-1 ${isActive ? 'text-text-base' : 'text-text-muted'}`}>
                    <span className={`w-2 h-2 rounded-full block ${isActive ? 'bg-brand-primary' : 'bg-secondary'}`}></span>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-headline-md text-text-base mb-1">{banner.title}</h3>
                    <p className="font-body-md text-body-md text-text-muted text-sm">{banner.subtitle}</p>
                  </div>
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-bg-muted border-dashed">
                  <label className="flex items-center cursor-pointer gap-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isActive}
                        onChange={() => toggleStatus(banner._id)} // 👉 Fire mutation with _id
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-brand-primary' : 'bg-bg-muted border border-bg-muted'}`}></div>
                      <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${isActive ? 'bg-bg-surface translate-x-4' : 'bg-text-muted'}`}></div>
                    </div>
                    <span className="font-label-md text-label-md text-text-muted">
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/banners/edit/${banner._id}`)} // 👉 Route with _id
                      className="p-2 text-text-muted hover:text-brand-primary hover:bg-bg-muted rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      onClick={() => deleteBanner(banner._id)} // 👉 Fire mutation with _id
                      className="p-2 text-text-muted hover:text-danger hover:bg-danger/10/50 rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {banners.length === 0 && !isLoading && (
        <div className="text-center py-12 text-text-muted font-body-lg">
          No banners available. Add one to get started.
        </div>
      )}
    </main>
  );
};

export default Banners;