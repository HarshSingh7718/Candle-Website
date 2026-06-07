import React from "react";
import SEO from "../SEO";
import PageBanner from "../ui/PageBanner";
import Steps from "../ui/Cards/Steps";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import MainBtn from "../ui/Buttons/MainBtn";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const OurStory = () => {
  // A reference to the section
  const container = useRef();

  useGSAP(
    () => {
      // GSAP code goes here.
      // The "scope" property ensures GSAP only looks inside this component.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      tl.from("h3, p, .border-t > div", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      tl.from(
        ".relative.group",
        {
          x: 100,
          opacity: 0,
          duration: 1.2,
          ease: "power2.out",
        },
        "-=0.8"
      );
    },
    { scope: container }
  ); // Scoping prevents "Element not found"

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#story",
      start: "top 80%", // Starts when the top of the section hits 80% of the viewport
      toggleActions: "play none none none",
    },
  });

  return (
    <>
      <SEO
        title="Our Story | Naisha Creations"
        description="Learn about the story behind Naisha Creations, our mission, and our handcrafted artisanal candles."
      />
      <PageBanner title="our story" currentPage="Our Story" />
      <section
        ref={container}
        className="py-[8%] md:py-24 max-w-7xl mx-auto px-6 lg:px-10"
        id="story"
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-black">
              A Story in Every Scent
            </h3>
            <p className="text-sm md:text-lg text-slate-600 dark:text-slate-800 leading-relaxed">
              Our journey began in 2024 with a simple dream: to create handmade candles that bring warmth, beauty, and happiness into every home. What started as a passion for candle making soon grew into a brand dedicated to designing unique, high-quality candles that turn everyday moments into memorable experiences.
            </p>
            <p className="text-sm md:text-lg text-slate-600 dark:text-slate-800 leading-relaxed">
              At Naisha Creations, every candle is thoughtfully handcrafted with attention to detail. From elegant floral candles and decorative statement pieces to scented jars and personalized gifts, each creation is made with love and care. We believe that a candle is more than just décor—it is a way to create memories, celebrate special occasions, and add a touch of comfort to any space.
            </p>
            <p className="text-sm md:text-lg text-slate-600 dark:text-slate-800 leading-relaxed">
              Inspired by modern trends, timeless aesthetics, and our customers' love for unique products, we continuously experiment with new designs, fragrances, and concepts to bring you candles that are both beautiful and meaningful.
            </p>
            <p className="text-sm md:text-lg text-slate-600 dark:text-slate-800 leading-relaxed">
              Today, Naisha Creations is proud to be a growing community of candle lovers who appreciate handmade artistry and thoughtful gifting. As we continue our journey, our mission remains the same: to craft candles that light up homes, hearts, and celebrations.
            </p>
            <div className="pt-6 grid grid-cols-2 gap-8 border-t border-primary/10">
              <div>
                <div className="text-2xl md:text-3xl font-black text-primary">
                  2024
                </div>
                <div className="text-sm font-bold uppercase tracking-wider opacity-60">
                  Year Founded
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-primary">
                  100%
                </div>
                <div className="text-sm font-bold uppercase tracking-wider opacity-60">
                  Hand-Poured
                </div>
              </div>
            </div>
          </div>
          <div className="relative group max-w-md mx-auto lg:max-w-none">
            {/* Layer 1: Solid brand-colored offset card */}
            <div className="absolute -inset-4 bg-primary/10 rounded-2xl -rotate-2 group-hover:rotate-0 transition-transform duration-500 ease-out"></div>
            {/* Layer 2: Thin bordered offset card */}
            <div className="absolute -inset-4 border border-primary/20 rounded-2xl -rotate-2 group-hover:rotate-0 transition-transform duration-500 ease-out"></div>
            <img
              alt="Candle making workspace"
              className="relative rounded-2xl shadow-2xl w-full aspect-[4/6] md:h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              data-alt="Artisan workspace with dried flowers and wax"
              src="https://res.cloudinary.com/dk1qzyep1/image/upload/v1780772432/naisha-photo-with-candle_nbikzv.webp"
            />
          </div>
        </div>
      </section>
      {/* <!-- Our Process Section --> */}
      <Steps />
      {/* <!-- Our Mission --> */}
      <section className="py-8 md:py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="rounded-3xl bg-background-dark text-text-base overflow-hidden relative">
          <div className="grid  lg:grid-cols-2">
            <div className="p-12 lg:p-20 flex flex-col justify-center">
              <h3 className="text-2xl md:text-4xl font-black mb-5 md:mb-8">
                Our Mission
              </h3>
              <blockquote className="text-md md:text-2xl font-light italic border-l-4 border-primary pl-8 mb-5 md:mb-8 leading-relaxed">
                "Lighting up homes, celebrations, and special moments—one candle at a time. ✨🕯️"
              </blockquote>
              <p className="text-sm md:text-lg text-slate-600 dark:text-slate-800 leading-relaxed mb-2 md:mb-8">
                At Naisha Creations, our mission is to craft beautiful, high-quality handmade candles that bring warmth, joy, and elegance to every space. We are dedicated to combining creativity, premium ingredients, and skilled craftsmanship to create unique candles that inspire moments of relaxation, celebration, and connection.
              </p>
              <div className="mb-2 md:mb-8">
                <p className="text-sm md:text-lg text-slate-600 dark:text-slate-800 leading-relaxed mb-4">
                  We strive to:
                </p>
                <ul className="text-sm md:text-lg text-slate-600 dark:text-slate-800 leading-relaxed space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Create innovative and aesthetically pleasing candle designs.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Deliver exceptional quality and customer satisfaction.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Offer unique gifting options for every occasion.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Continuously explore new trends, fragrances, and creative concepts.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Spread happiness through handcrafted products made with passion and care.</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm md:text-lg text-slate-600 dark:text-slate-800 leading-relaxed mb-2 md:mb-8">
                Our goal is to make every candle more than just a product—it should be an experience that adds beauty, comfort, and lasting memories to your life.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 mt-6">
                <span className="inline-flex items-center px-5 py-2.5 bg-coffee/10 text-coffee border border-coffee/20 text-sm font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  📦 Plastic-Free Packaging
                </span>
                <span className="inline-flex items-center px-5 py-2.5 bg-coffee/10 text-coffee border border-coffee/20 text-sm font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  🐰 Vegan &amp; Cruelty-Free
                </span>
                <span className="inline-flex items-center px-5 py-2.5 bg-coffee/10 text-coffee border border-coffee/20 text-sm font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  🌱 Phthalate-Free Oils
                </span>
              </div>
            </div>
            <div className="min-h-[400px]">
              <img
                alt="Cozy atmosphere"
                className="w-full  h-full object-cover"
                data-alt="Person relaxing in a cozy room with lit candles"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxt09YxjJvkaK2fbWpmx3PDvePVdQYRSjoqdWXb5JiB86env6v5jqQUL64mMTM3FdDFvtLDYXX39KKmlchQaY2IL-VaiKqxZENMKkNB0czsTQuGWmDnUX2W9b91D4uwjf4JsqSJnM96eDUObrXazlmYaNvzKgfLYAtmsQQwE-N-zBrCKpG9s7rB6vXQVEUUG14l1wrnbin8975VamTgnbNzsxU9LLm8b2eHnUsWNcGmKQeFvMO2sc6hK9QrTlCpsoa5Z54wGoTr9e8"
              />
            </div>
          </div>
        </div>
      </section>
      {/* <!-- Gallery / Process Visuals --> */}
      <div className="bg-light-yellow hidden md:block">
        <section className="pb-24  max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-12 flex items-end justify-between">
            <h3 className="text-3xl font-serif py-4">
              Behind the <span className="italic font-light">Craft</span>
            </h3>
            <span className="text-sm uppercase tracking-widest text-stone-400 mb-2">
              Visual Diary
            </span>
          </div>
          <div className="columns-1 md:columns-2 lg:columns-4 gap-6 space-y-6">
            {[
              {
                src: "https://res.cloudinary.com/dk1qzyep1/image/upload/v1780775509/fragnance-oil-addition_wmzwbr.webp",
                alt: "Fragnance Oils",
              },
              {
                src: "https://res.cloudinary.com/dk1qzyep1/image/upload/v1780772432/wax-pouring_pqqwle.webp",
                alt: "Wax Poured",
              },
              {
                src: "https://res.cloudinary.com/dk1qzyep1/image/upload/v1780772431/wick-setting_uzs3qf.webp",
                alt: "Wick Setting",
              },
              {
                src: "https://res.cloudinary.com/dk1qzyep1/image/upload/v1780772432/topping-addition_l00qgp.webp",
                alt: "Topping Addition",
              },
            ].map((img, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full aspect-[4/5] object-cover object-center group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
                  onError={(e) => {
                    e.target.src = `https://images.unsplash.com/photo-1596435707700-6264292b861d?auto=format&fit=crop&q=80&w=600`;
                  }}
                />
                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <p className="text-text-on-brand font-serif tracking-widest uppercase text-sm">
                    {img.alt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* <!-- CTA --> */}
      <section className="py-24 text-center bg-background-light dark:bg-background-dark border-t border-primary/10">
        <h3 className="text-2xl md:text-4xl font-black mb-6">
          Experience the Glow
        </h3>
        <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl mx-auto">
          Discover our signature collection and find the perfect scent for your
          sanctuary.
        </p>
        <div className="flex justify-center gap-4">
          <MainBtn
            path="/collections/candles"
            text={" Shop All Candles"}
            className="!bg-coffee !text-white"
          />
        </div>
      </section>
    </>
  );
};

export default OurStory;
