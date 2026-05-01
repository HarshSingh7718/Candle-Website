import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { useOptions } from '../context/OptionContext';

const Options = () => {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(3); // Default to Toppings for showcase
  const { options, toggleStatus, deleteOption } = useOptions();
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo('.header-animate', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
      
      // Tabs animation
      gsap.fromTo('.tab-animate', 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.2 }
      );
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  // Animate cards on tab change
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.card-animate', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [activeTab]);

  const tabs = [
    { id: 1, name: 'Choose Scent' },
    { id: 2, name: 'Choose Vessel' },
    { id: 3, name: 'Choose Toppings' },
    // { id: 4, name: 'Gift Message' }
  ];

  const currentOptions = options.filter(opt => opt.tabId === activeTab);

  const getAddLabel = () => {
    switch (activeTab) {
      case 1: return 'Add New Scent';
      case 2: return 'Add New Vessel';
      case 3: return 'Add New Topping';
      case 4: return 'Add New Layout';
      default: return 'Add New';
    }
  };

  return (
    <div className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full" ref={containerRef}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md mb-stack-lg header-animate">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">Customization Options</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Configure the multi-step journey for your bespoke products. Define scents, vessels, toppings, and final touches.</p>
        </div>
        <button 
          onClick={() => navigate(`/options/add?tabId=${activeTab}`)}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md shadow-[0_2px_0_0_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity whitespace-nowrap self-start md:self-auto header-animate cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Option
        </button>
      </div>

      {/* Stepper / Tabs */}
      <div className="mb-stack-lg border-b border-surface-variant">
        <div className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col gap-2 min-w-[120px] group tab-animate cursor-pointer ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface transition-colors'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full font-label-sm text-label-sm transition-colors ${isActive ? 'bg-primary text-on-primary' : 'border border-outline text-on-surface-variant group-hover:border-on-surface'}`}>
                    {tab.id}
                  </span>
                  <span className={`font-label-md text-label-md whitespace-nowrap ${isActive ? 'font-bold' : ''}`}>
                    {tab.name}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute -bottom-[17px] left-0 w-full h-1 bg-primary rounded-t-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentOptions.map((opt) => (
          <div 
            key={opt.id} 
            className={`bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex flex-col gap-4 shadow-sm relative group card-animate transition-opacity duration-300 ${opt.status === 'Hidden' ? 'opacity-70' : 'opacity-100'}`}
          >
            {/* Delete Overlay Button */}
            <button 
              onClick={() => deleteOption(opt.id)}
              className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error hover:text-white cursor-pointer"
              title="Delete"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>

            {/* Image full width inside padding */}
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-surface-container flex-shrink-0 border border-surface-variant shadow-sm relative">
              <img 
                alt={opt.name} 
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${opt.status === 'Hidden' ? 'grayscale opacity-70' : ''}`} 
                src={opt.img}
              />
              {opt.status === 'Hidden' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/80 drop-shadow-md">visibility_off</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
              {/* Title & Toggle */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading text-lg font-bold text-on-surface">{opt.name}</h3>
                <button 
                  onClick={() => toggleStatus(opt.id)}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-300 cursor-pointer flex-shrink-0 ${opt.status === 'Active' ? 'bg-[#c27823]' : 'bg-surface-dim'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-[2px] transition-transform duration-300 shadow-sm ${opt.status === 'Active' ? 'left-[22px]' : 'left-[2px]'}`} />
                </button>
              </div>
              
              {/* Description */}
              <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-4">
                {opt.desc}
              </p>

              {/* Bottom Row */}
              <div className="mt-auto pt-3 border-t border-surface-variant/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface-variant">
                    +${Number(opt.price).toFixed(2)}
                  </span>
                  {opt.stock !== undefined && (
                    <span className="text-xs text-on-surface-variant/70 border-l border-surface-variant pl-2">
                      {opt.stock} in stock
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/options/edit/${opt.id}`)}
                    className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                    title="Edit Option"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  {opt.status === 'Active' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#fcead7] text-[#c27823]">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-surface-variant text-on-surface-variant">
                      Hidden
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Option Card */}
        <button 
          onClick={() => navigate(`/options/add?tabId=${activeTab}`)}
          className="bg-transparent border-2 border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-surface-container-low transition-all min-h-[300px] group card-animate cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary-fixed transition-colors">
            <span className="material-symbols-outlined text-[24px]">add</span>
          </div>
          <div className="text-center">
            <span className="font-heading text-lg font-bold text-on-surface block mb-1">{getAddLabel()}</span>
            <span className="text-sm text-on-surface-variant">Create a new decorative addition</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Options;

