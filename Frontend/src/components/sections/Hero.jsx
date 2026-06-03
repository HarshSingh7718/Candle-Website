import { useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHomeData } from "../../hooks/useHomeData";
import Loader from "../ui/Loader";

/**
 * Hero – Full-width banner carousel.
 *
 * Each banner is a clickable image that navigates to /collections/candles.
 * No overlay text or buttons — the image speaks for itself.
 * Responsive aspect ratio: taller on mobile (4/3), 16/9 on md+.
 */
function Hero() {
  const { data: homeData, isLoading } = useHomeData();
  const banners = homeData?.banners || [];
  const heroRef = useRef(null);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-light-yellow">
        <Loader />
      </div>
    );
  }

  // If no banners exist at all, don't render the swiper to prevent crashes
  if (banners.length === 0) return null;

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
        // Only loop if there are enough banners
        loop={banners.length > 1}
        className="heroSwiper"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner._id}>
            {/* Entire banner image is a clickable link — no overlay text */}
            <Link
              to="/collections/candles"
              className="block w-full relative aspect-[4/5] md:aspect-video overflow-hidden"
            >
              <picture className="absolute inset-0 w-full h-full">
                <source media="(min-width: 768px)" srcSet={banner.desktopImage?.url} />
                <img
                  src={banner.mobileImage?.url}
                  alt={banner.title || "Shop our candle collection"}
                  className="w-full h-full object-cover"
                />
              </picture>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* CUSTOM NAV — only shown when multiple banners exist */}
      {banners.length > 1 && (
        <>
          <button className="hero-prev absolute left-10 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-light-yellow/10 hover:bg-light-yellow hover:text-heading p-4 rounded-full text-light-yellow backdrop-blur-sm border border-light-yellow/20 cursor-pointer">
            <ChevronLeft size={24} />
          </button>

          <button className="hero-next absolute right-10 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-light-yellow/10 hover:bg-light-yellow hover:text-heading p-4 rounded-full text-light-yellow backdrop-blur-sm border border-light-yellow/20 cursor-pointer">
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </section>
  );
}

export default Hero;
