import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import sectionBanner from "/images/section-banner.jpg";

function PageBanner({ title, currentPage, productName, bgImage, isLoading }) {
  const bannerRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heading = bannerRef.current.querySelector("h3");
      const separator = bannerRef.current.querySelector(".banner-separator");
      const breadcrumb = bannerRef.current.querySelector("ul");

      // Simple entry animations — no ScrollTrigger to avoid glitches
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(heading, {
        y: 30,
        opacity: 0,
        duration: 0.8,
      })
        .from(
          separator,
          {
            scaleX: 0,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          breadcrumb,
          {
            y: 15,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.3"
        );
    }, bannerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={bannerRef}
      className="relative min-h-56 md:min-h-72 flex justify-center items-center overflow-hidden bg-[#291a18]"
    >
      {/* Background image with subtle scale for depth */}
      <div
        className={`absolute inset-0 bg-center bg-cover bg-no-repeat scale-105 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: isLoading ? 'none' : `url(${bgImage || sectionBanner})` }}
      />

      {/* Rich gradient overlay — bordeaux to dark, with side vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(94,50,50,0.55) 0%, rgba(41,26,24,0.82) 100%)",
        }}
      />

      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Content */}
      <div className="container px-4 z-10 text-center">
        <h3 className="text-3xl md:text-5xl font-semibold text-white tracking-wide leading-tight truncate px-4 max-w-full">
          {productName ? productName : title}
        </h3>

        {/* Decorative separator */}
        <div className="banner-separator w-12 h-[2px] bg-coffee-300/70 mx-auto my-4 origin-center" />

        <ul className="flex items-center justify-center text-white/80 space-x-2 text-sm md:text-base">
          <li>
            <Link
              to="/"
              className="hover:text-white transition-colors duration-200"
            >
              Home
            </Link>
          </li>
          <ChevronRight size={16} strokeWidth={1.5} className="opacity-60" />
          <li>
            <span
              className={
                !productName
                  ? "text-white font-medium"
                  : "text-white/80"
              }
            >
              {currentPage}
            </span>
          </li>
          {productName && (
            <>
              <ChevronRight
                size={16}
                strokeWidth={1.5}
                className="opacity-60"
              />
              <li className="text-white font-medium truncate max-w-[200px] md:max-w-none">
                {productName}
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default PageBanner;
