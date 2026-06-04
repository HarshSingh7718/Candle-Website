import gsap from "gsap";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import sectionBanner from "/images/section-banner.jpg";

gsap.registerPlugin(ScrollTrigger);

function PageBanner({ title, currentPage, productName }) {
  const bannerRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heading = bannerRef.current.querySelector("h3");
      const breadcrumb = bannerRef.current.querySelector("ul");

      gsap.from(heading, {
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: heading,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(breadcrumb, {
        y: 20,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: breadcrumb,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    }, bannerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={bannerRef}
      className="section-banner bg-center bg-cover
      bg-no-repeat min-h-80 md:min-h-112 flex justify-center items-center relative z-1"
      style={{ backgroundImage: `url(${sectionBanner})` }}
    >
      <div className="container px-4 z-10 ">
        <h3 className="text-2xl md:text-4xl text-text-on-brand mb-3">
          {productName ? productName : title}
        </h3>

        <ul className="flex items-center text-text-on-brand space-x-2">
          <li>
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight size={18} strokeWidth={1.5} />
          <li>
            <span className={!productName ? "text-text-on-brand font-medium" : ""}>
              {currentPage}
            </span>
          </li>
          {productName && (
            <>
              <ChevronRight size={18} strokeWidth={1.5} />
              <li className="text-text-on-brand font-medium truncate max-w-[200px] md:max-w-none">
                {productName}
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="overlay bg-primary absolute top-0 left-0 w-full h-full opacity-30"></div>
    </div>
  );
}

export default PageBanner;
