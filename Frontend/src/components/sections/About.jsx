const aboutMainImg = "/images/Index/About/about-main-image.jpg";
const aboutImg1 = "/images/Index/About/about-image01.jpg";
const aboutImg2 = "/images/Index/About/about-image02.jpg";
const aboutImg3 = "/images/Index/About/about-image03.jpg";

import MainBtn from "../ui/Buttons/MainBtn";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


function About() {
    const aboutRef = useRef();

useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  const ctx = gsap.context(() => {

    gsap.from(".about-image", {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".about-image",
        start: "top 85%",
        toggleActions: "play none none reset",
      }
    });
    gsap.from(".about-content", {
      x: 100,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".about-content",
        start: "top 85%",
        toggleActions: "play none none reset",
      }
    });

      gsap.from(".image", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger:0.2,
     
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".image",
        start: "top 90%",
        toggleActions: "play none none reset",
      }
    })


},aboutRef);
ScrollTrigger.refresh();
return ()=>ctx.revert();
},[]);


    return (
        <>
            <section ref={aboutRef} id="about" className="about container py-[8%] mx-auto section-container gap-14 px-4">
                <div className="about-image  rounded-sm w-full lg:w-1/2 max-w-full
                lg:max-w-125 mx-auto relative overflow-hidden">
                    <div className="about-bg-video absolute inset-0 -z-10"></div>
                    <img src={aboutMainImg} alt="Our Story" className="about w-full h-auto object-cover rounded-sm" loading="lazy" />
                </div>

                <div className="about-content w-full lg:w-1/2">
    <span className="title-span">Our Story</span>
    <h2 className="heading-1 mb-5">
        <span className="text-coffee">Crafting Moments</span> <br />
        with Artisanal Precision
    </h2>

    <p className="pera-text">
    Founded on the belief that scent is a bridge to memory and tranquility, Naisha Creations brings you candles that are more than just wax and wick. Every piece is a story of craft, poured by hand with organic ingredients to elevate your everyday rituals.
</p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-10 xl:gap-8
lg:grid-cols-3 mx-auto mb-1 md:mb-18">
    <div className="image ">

        <img src={aboutImg1} alt="Artisanal process"
className="section-image w-full md:h-auto object-cover rounded-sm " loading="lazy" />
    </div>
       <div className="image ">

        <img src={aboutImg2} alt="Premium ingredients"
className="section-image w-full aspect-[3/4] md:h-auto object-cover rounded-sm" loading="lazy" />
    </div>
       <div className="image ">

        <img src={aboutImg3} alt="Final product"
className="section-image w-full h-auto object-cover rounded-sm hidden md:block" loading="lazy" />
    </div>
</div>

<MainBtn path="/about" text={"Discover More"} className="!bg-black !text-white" />
</div>
            </section>
        </>
    )
}

export default About
