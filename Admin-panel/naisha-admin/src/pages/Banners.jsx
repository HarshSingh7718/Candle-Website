import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useBanners } from '../context/BannerContext';

const Banners = () => {
  const { banners, deleteBanner, toggleStatus } = useBanners();
  const navigate = useNavigate();

  const mainRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    // Fade + slide up entire page header
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // Stagger cards
    if (cardsRef.current.length > 0) {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
      );
    }
  }, [banners.length]); // Re-run animation if length changes

  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-margin-page max-w-container-max mx-auto w-full">
      
      {/* Header Section */}
      <div ref={mainRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-stack-lg">
        <div>
          <h2 className="font-heading text-headline-lg text-on-surface mb-2">Banner Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Manage promotional banners and hero sections for the storefront. Ensure high-quality imagery aligns with the artisanal heritage theme.
          </p>
        </div>
        <button 
          onClick={() => navigate('/banners/add')}
          className="shrink-0 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3 px-6 rounded-lg shadow-sm shadow-amber-900/20 transition-all flex items-center justify-center gap-2 border-b-2 border-primary-container hover:border-surface-tint cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Banner
        </button>
      </div>

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter">
        {banners.map((banner) => {
          const isActive = banner.status === 'Active';
          
          return (
            <article 
              key={banner.id}
              ref={addToCardsRef}
              className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden flex flex-col shadow-sm shadow-amber-900/5 group hover:shadow-md transition-shadow"
            >
              {/* Preview Area (Always on top now) */}
              <div className="w-full h-48 sm:h-64 relative bg-surface-container shrink-0 border-b border-surface-variant">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title}
                  className={`w-full h-full object-cover object-center absolute inset-0 transition-all duration-300 ${isActive ? '' : 'grayscale opacity-80'}`} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className={`bg-surface-container-lowest/90 backdrop-blur-sm font-label-sm text-label-sm px-2 py-1 rounded shadow-sm flex items-center gap-1 ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                    <span className={`w-2 h-2 rounded-full block ${isActive ? 'bg-primary' : 'bg-secondary'}`}></span> 
                    {banner.status}
                  </span>
                </div>
              </div>
              
              {/* Content Area (Below image) */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-headline-md text-on-surface mb-1">{banner.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm">{banner.subtitle}</p>
                  </div>
                </div>
                
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-surface-variant border-dashed">
                  <label className="flex items-center cursor-pointer gap-3">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={isActive}
                        onChange={() => toggleStatus(banner.id)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-primary' : 'bg-surface-variant border border-outline-variant'}`}></div>
                      <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${isActive ? 'bg-surface-container-lowest translate-x-4' : 'bg-on-surface-variant'}`}></div>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface-variant">
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/banners/edit/${banner.id}`)}
                      className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                      onClick={() => deleteBanner(banner.id)}
                      className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/50 rounded-lg transition-colors cursor-pointer"
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
      
      {banners.length === 0 && (
        <div className="text-center py-12 text-on-surface-variant font-body-lg">
          No banners available. Add one to get started.
        </div>
      )}
    </main>
  );
};

export default Banners;
