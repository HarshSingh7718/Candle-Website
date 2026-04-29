import React, { useEffect, useRef, useState } from 'react';

const CANDLE_STEPS = [
  {
    number: "01",
    title: "Scent Selection",
    description: "Browse our curated library of premium essential oils and hand-pick the fragrance profile that matches your mood."
  },
  {
    number: "02",
    title: "Vessel Design",
    description: "Select from our range of handcrafted glass or ceramic vessels to perfectly complement your home interior."
  },
  {
    number: "03",
    title: "Artisan Pouring",
    description: "Our experts hand-pour natural soy wax at precise temperatures to ensure a clean, long-lasting, and even burn."
  },
  {
    number: "04",
    title: "Enjoying Glow",
    description: "Light your custom candle, sit back, and transform your space with a warm glow and artisanal aroma."
  }
];

const Steps = () => {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const stepsRef = useRef([]);
  const [gsapLoaded, setGsapLoaded] = useState(false);

  useEffect(() => {
    // Dynamically inject GSAP script to avoid bundler resolution issues
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    script.async = true;
    script.onload = () => setGsapLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Only run animations if GSAP is loaded and available on the window object
    if (!gsapLoaded || !window.gsap) return;

    const gsap = window.gsap;
    const ctx = gsap.context(() => {
      // Initial state: hidden and slightly shifted
      gsap.set([headerRef.current, ...stepsRef.current], { 
        opacity: 0, 
        y: 40 
      });

      // Timeline for coordinated animation
      const tl = gsap.timeline({ 
        defaults: { ease: "power4.out", duration: 1.4 } 
      });

      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        delay: 0.8
      })
      .to(stepsRef.current, {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 1
      }, "-=0.6");
    }, containerRef);

    return () => ctx.revert();
  }, [gsapLoaded]);

  return (
    <div className="min-h-screen bg-light-yellow font-sans selection:bg-stone-200" ref={containerRef}>
     

      <section className="py-20 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-15 md:mb-20" ref={headerRef} style={{ opacity: gsapLoaded ? 1: 0 }}>
          <p className="uppercase tracking-[0.4em] text-[11px] font-bold text-stone-400 mb-4">
            Steps
          </p>
          <h2 className="text-2xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="text-[#b19777]">4 Easy Steps</span>
            <br />
            <span className="text-[#1a2b3c]">To Your Perfect Candle</span>
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-8">
          {CANDLE_STEPS.map((step, index) => (
            <div 
              key={step.number}
              ref={(el) => (stepsRef.current[index] = el)}
              className="flex flex-col items-center text-center"
              style={{ opacity: gsapLoaded ? 1 : 0 }}
            >
              {/* Number (Hover effects removed) */}
              <div className="text-5xl md:text-7xl font-bold text-[#b19777] mb-5 md:mb-8 opacity-90">
                {step.number}
              </div>
              
              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-[#1a2b3c] mb-2.5 md:mb-4">
                {step.title}
              </h3>
              
              {/* Description */}
              <p className="text-stone-500 leading-relaxed text-[14px] md:text-[16px] max-w-[280px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer Decoration */}
      <div className="flex justify-center pb-10 md:pb-12 opacity-30">
        <div className="w-16 h-[1px] bg-[#b19777]"></div>
      </div>
    </div>
  );
};

export default Steps;