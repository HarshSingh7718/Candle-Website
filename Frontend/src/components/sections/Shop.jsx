import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductData from "../../assets/Data/ProductData.json";
import ProductCard from "../ui/Cards/ProductCard";
import MainBtn from "../ui/Buttons/MainBtn";


gsap.registerPlugin(ScrollTrigger);
const Shop = () => {
  const shopRef = useRef();
  const headingRef = useRef();
      useEffect(() => {
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
  },shopRef);

  return()=>ctx.revert();

      },[]);

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
          toggleActions: "play none none reset",
        },
      });
    }, headingRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
    <section className="bg-light-yellow" id="collections">
  <div className="container py-[8%] mx-auto px-4">
    <div ref={headingRef} className="text-center w-full mb-16">
      <span className="title-span">- Curated Selection -</span>
      <h2 className="heading-1 mb-5">
        Our Artisanal
        <span className="text-coffee"> Collections </span>
      </h2>
      
    </div>
    
    
    <div ref={shopRef} className="grid 
grid-cols-2 lg:grid-cols-2 
xl:grid-cols-4 gap-10">

    {ProductData.slice(4, 12).map(product => (
    <ProductCard key={product.id} product={product} />
))}


</div>
<div className="flex justify-center mt-12 w-full">
    <MainBtn 
        path="/shop" 
        text={"EXPLORE ALL COLLECTIONS"} 
        className="!bg-coffee !text-white" 
    />
</div>
  </div>
 
</section>
    </>
  );
};

export default Shop;
