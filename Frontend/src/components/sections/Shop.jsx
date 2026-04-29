import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "../ui/Cards/ProductCard";
import MainBtn from "../ui/Buttons/MainBtn";
import { useHomeData } from "../../hooks/useHomeData"; // Updated Hook

gsap.registerPlugin(ScrollTrigger);

const Shop = () => {
  const shopRef = useRef();
  const headingRef = useRef();

  // 1. TanStack Query Hook (Replaces useStore and manual useEffect)
  const { data: homeData, isLoading } = useHomeData();

  // ✅ GSAP animation for product cards
  useEffect(() => {
    if (!homeData) return;

    const ctx = gsap.context(() => {
      const cards = shopRef.current.querySelectorAll(".product-card");

      gsap.from(cards, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: shopRef.current,
          start: "top 85%",
          toggleActions: "play none none reset",
        },
      });
    }, shopRef);

    return () => ctx.revert();
  }, [homeData]);

  // ✅ Heading animation
  useEffect(() => {
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
    }, headingRef);

    return () => ctx.revert();
  }, []);

  // 2. Loading State Handling
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
        {/* Heading */}
        <div ref={headingRef} className="text-center w-full mb-16">
          <span className="title-span">- Curated Selection -</span>
          <h2 className="heading-1 mb-5">
            Our Artisanal
            <span className="text-coffee"> Collections </span>
          </h2>
        </div>

        {/* FEATURED PRODUCTS */}
        <div
          ref={shopRef}
          className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-10"
        >
          {homeData?.featured?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="flex justify-center mt-12 w-full">
          <MainBtn
            path="/collections/candles"
            text={"EXPLORE ALL CANDLES"}
            className="!bg-coffee !text-white"
          />
        </div>
      </div>
    </section>
  );
};

export default Shop;