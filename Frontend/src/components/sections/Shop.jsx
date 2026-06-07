import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "../ui/Cards/ProductCard";
import MainBtn from "../ui/Buttons/MainBtn";
import { useHomeData } from "../../hooks/useHomeData";

gsap.registerPlugin(ScrollTrigger);

/**
 * Section configuration — each object renders its own heading + product grid.
 * Maps to the keys returned by the backend's /home endpoint.
 */
const SECTIONS = [
  { key: "bestSeller", subtitle: "- Top Picks -", title: "Best", highlight: "Sellers" },
  { key: "trending", subtitle: "- What's Hot -", title: "Trending", highlight: "Now" },
  { key: "latest", subtitle: "- Just Arrived -", title: "Latest", highlight: "Arrivals" },
];

/**
 * ProductSection – A single heading + product grid.
 * Extracted to keep Shop clean and allow per-section GSAP triggers.
 */
const ProductSection = ({ section, products }) => {
  const gridRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current || !headingRef.current || products.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 90%",
        },
      });

      gsap.from(gridRef.current.children, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
          toggleActions: "play none none reset",
        },
      });
    });

    return () => ctx.revert();
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <div className="mb-20 last:mb-0">
      <div ref={headingRef} className="text-center w-full mb-16">
        <span className="title-span">{section.subtitle}</span>
        <h2 className="heading-1 mb-5">
          {section.title}
          <span className="text-coffee"> {section.highlight} </span>
        </h2>
      </div>

      <div
        ref={gridRef}
        className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-6 pb-8 px-4 -mx-4 snap-x"
      >
        {products.map((product) => (
          <div key={product._id} className="w-[40vw] md:w-[28.5vw] lg:w-[22.2vw] shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-2 w-full">
        <MainBtn
          path={`/collections/candles?filter=${section.key}`}
          text={`SHOP MORE ${section.title.toUpperCase()}`}
          className="!bg-brand-primary !text-text-on-brand hover:!bg-brand-secondary"
        />
      </div>
    </div>
  );
};

const Shop = () => {
  const { data: homeData, isLoading } = useHomeData();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-coffee border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="bg-light-yellow" id="collections">
      <div className="container py-[8%] mx-auto px-4">
        {SECTIONS.map((section) => (
          <ProductSection
            key={section.key}
            section={section}
            products={homeData?.[section.key] || []}
          />
        ))}
      </div>
    </section>
  );
};

export default Shop;