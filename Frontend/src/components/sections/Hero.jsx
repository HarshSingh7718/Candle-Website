import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import gsap from "gsap";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import MainBtn from "../ui/Buttons/MainBtn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHomeData } from '../../hooks/useHomeData';


function Hero() {
  const { data: homeData, loading } = useHomeData();
  const banners = homeData?.banners || [];
  const heroRef = useRef(null);

  // GSAP Animation for text on slide change
  const handleSlideChange = () => {
    gsap.fromTo(
      ".hero-title",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.2 }
    );
    gsap.fromTo(
      ".hero-p",
      { opacity: 0 },
      { opacity: 1, duration: 1.5, delay: 0.5, ease: "power2.out" }
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-pulse font-serif italic text-2xl text-stone-400">
          Loading Aura...
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden group" id="hero" ref={heroRef}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={{
          nextEl: ".hero-next",
          prevEl: ".hero-prev",
        }}
        loop={true}
        onSlideChange={handleSlideChange}
        className="heroSwiper"
      >
        {banners.map((banners) => (
          <SwiperSlide key={banners._id}>
            <div
              className="min-h-screen w-full flex flex-col justify-center items-center bg-no-repeat bg-cover bg-center transition-transform duration-1000"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${banners.image?.url})` 
              }}
            >
              <div className="hero-content text-white text-center px-6">
                <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-bold pb-5 tracking-tight">
                  {banners.title || "Premium Candles"}
                </h1>

                <p className="hero-p max-w-2xl mx-auto pb-10 text-gray-100 font-light text-lg md:text-xl leading-relaxed">
                  {banners.subtitle || "Experience luxury candles crafted with care."}
                </p>

                <div className="hero-title">
                   <MainBtn text="Explore Collection" path="/collections/candles" />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* CUSTOM NAV - Visible on hover */}
      <button className="hero-prev absolute left-10 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/10 hover:bg-white hover:text-black p-4 rounded-full text-white backdrop-blur-sm border border-white/20">
        <ChevronLeft size={24} />
      </button>

      <button className="hero-next absolute right-10 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/10 hover:bg-white hover:text-black p-4 rounded-full text-white backdrop-blur-sm border border-white/20">
        <ChevronRight size={24} />
      </button>
    </section>
  );
}

export default Hero;