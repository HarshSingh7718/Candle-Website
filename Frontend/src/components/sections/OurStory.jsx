import React from "react";
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
              Founded on the principles of mindfulness and craftsmanship, Naisha
              Creations began with a simple goal: to create candles that tell a
              story. Every scent is a memory, and every flicker is a moment of
              peace.
            </p>
            <p className="text-sm md:text-lg text-slate-600 dark:text-slate-800 leading-relaxed">
              Our founder started experimenting with botanical oils and soy wax
              in 2018, seeking a cleaner, more intentional way to fragrance a
              home. What began as gifts for friends blossomed into a community
              of scent-lovers who value quality over mass production.
            </p>
            <div className="pt-6 grid grid-cols-2 gap-8 border-t border-primary/10">
              <div>
                <div className="text-2xl md:text-3xl font-black text-primary">2018</div>
                <div className="text-sm font-bold uppercase tracking-wider opacity-60">
                  Year Founded
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-primary">100%</div>
                <div className="text-sm font-bold uppercase tracking-wider opacity-60">
                  Hand-Poured
                </div>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/10 rounded-xl -rotate-2 group-hover:rotate-0 transition-transform"></div>
            <img
              alt="Candle making workspace"
              className="relative rounded-xl shadow-2xl w-full aspect-square md:h-[500px] object-cover"
              data-alt="Artisan workspace with dried flowers and wax"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0hodXPt8eHLvHRbxq1jkEioO_gbw8c4kIb9PulFDlfahrG9HFoAIcXfxZogBe9s0KTE9xI1f6tBtzT4wYJ60MR30-5DR0nCHKSwlSB8MUzA5NJd5w-m9AXPl9mKmADgNF2SpICt62SRUi4n8GnqO9Sm90IgxbUeYHhnpB-4XUQUHEa5o1mNPTJ4pauradB161JfWK39gP5cau9vRJoeharvVBn1ksbop8SMtPBlc9a43ywyDR_yryfuPGatwBPt9gzUAmp-Iuy70_"
            />
          </div>
        </div>
      </section>
      {/* <!-- Our Process Section --> */}
      <Steps />
      {/* <!-- Our Mission --> */}
      <section className="py-8 md:py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="rounded-3xl bg-background-dark text-black overflow-hidden relative">
          <div className="grid  lg:grid-cols-2">
            <div className="p-12 lg:p-20 flex flex-col justify-center">
              <h3 className="text-2xl md:text-4xl font-black mb-5 md:mb-8">Our Mission</h3>
              <blockquote className="text-md md:text-2xl font-light italic border-l-4 border-primary pl-8 mb-5 md:mb-8 leading-relaxed">
                "To illuminate the everyday moments and transform spaces into
                sanctuaries of peace through sustainable, handcrafted
                fragrance."
              </blockquote>
              <p className="text-sm md:text-lg text-slate-400 leading-relaxed mb-2 md:mb-8">
                We are committed to environmental stewardship, social
                responsibility, and the timeless beauty of artisanal craft. For
                every candle sold, a portion of proceeds goes toward
                reforestation projects.
              </p>
              <div className="hidden md:flex">
              <div className="flex flex-wrap gap-4">
                <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium">
                  Plastic-Free Packaging
                </span>
                <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium">
                  Vegan &amp; Cruelty-Free
                </span>
                <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium">
                  Phthalate-Free Oils
                </span>
              </div>
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
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {[
              {
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrnOVPTAQTDu8a4WhT_cFZcJIECcC9W0OlfSOvDG-hWme0iiAxeAKUl5zPmhA29xuc35Egv1lv0bEgZDWFrHvHLWec3Xd8SUu8LOA4oGcxjcuDMZZWdyRgnn9IzPARiGSPRAsf_TrVa2MUm2BbWlT0N5t2hxOllalkaLHlGknAR-SwqjqS_YbhewYg4M_018Sdcv95QKzMjdWg3axq2lYMcaJ5_h6c_3JNkfdKa7Od10T4g48YuGi6MxH48zGg0EnJeSVXAlr57cxF",
                alt: "Wax Poured",
              },
              {
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqRTd--_RZ4z8exzM4aOUSostFXW2AEmQruQRWamGzAIA9tf5x3zEFYlJw4GfALe_0LArIR6rMRH2cwKK4jDpNoqEJxDW1cpBerB9FHb1gP_id9YfGUH_SG3mfX4UinSbXuCFNaoQHvsWCQejvytF9a65xgAVmK9DR3c6Al1F7zaVZVYMmmh5e3FsPrBfMvkBcAHv1wBMio1AImVpyqm5zooTJGAKAPwdEQ_ZzStbuIZ88-MKu262PcClW8XiPDM6QDWlRPhuKy_cN",
                alt: "Oils",
              },
              {
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqEx6Aln3qEUIeVDjtP1wP-kV-3ttqNdCpArx6MmMTZReWdKXvrQsmaOQM2bIci7j4Jzca7t93Gp267-myB5JpxgmMbGz0x1UgRjlB8JicNFXtTHg3wn-cCeev5b9840HGnFLYekaXo6szUakZA549hIzb0roNc6x0jrw5he3SWduRwvWR8eGQvMiwdjDfYZsXqGMMWR1kIhZBjCQx8rOL99pALbC7bthO5TzOcCLmTq8KjlaE9dg1E_FCDs4_bVehkfneabMmVeZT",
                alt: "Wick Detail",
              },
              {
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrnOVPTAQTDu8a4WhT_cFZcJIECcC9W0OlfSOvDG-hWme0iiAxeAKUl5zPmhA29xuc35Egv1lv0bEgZDWFrHvHLWec3Xd8SUu8LOA4oGcxjcuDMZZWdyRgnn9IzPARiGSPRAsf_TrVa2MUm2BbWlT0N5t2hxOllalkaLHlGknAR-SwqjqS_YbhewYg4M_018Sdcv95QKzMjdWg3axq2lYMcaJ5_h6c_3JNkfdKa7Od10T4g48YuGi6MxH48zGg0EnJeSVXAlr57cxF",
                alt: "Botanicals",
              },
              {
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlV27YyezoXFBWvXsIgLt56wYw8AB-IznlJDHWOeH1VSyFXXxRi_SGjHbm_AE3eRQPO6dLcYj0jGfEkJ42_oraT8Hc356_CGwSqfGFxbIkXv6zpgRAcEQpNBIf9mfKP26RkQC2AgnU73gw5liUPkpez5qt71WVhyfdShxErItXYVpvV8yd2M_QpY_sHAf6_ZH5Qw3x-yzOeRwlSEw9aqpGlNkMEPOGQWE3ixD-hHica2tJxh5YUVplliwMBRCidIy39RDvKcR-XjCy",
                alt: "Lifestyle",
              },
              {
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuHMsFuS4ISH-11iii-y_HxqQuqI5ZONCq4a-nwopxlZguZWph4sZVT83RswvgTIOv3OtM6Qk3_eqt9CcWm-GvA9VxRx1JWnrUiB8wEIaNzU9ubVRtNjrT_wFc992x6YI26EjZYroaD8qFAvSujvgakxQ5gygXnQjDMfIn0_0Os1Wl1ajyoIzPqBPkiYLwVoseBfQ2OEpnXodzouSnc_jbHrNSSozZN_lVrrbD_ulFb0osl8v1OoiVxulwo9xKa2QCESi7Z1Kh_iRS",
                alt: "Recycled Packaging",
              },
            ].map((img, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
                  onError={(e) => {
                    e.target.src = `https://images.unsplash.com/photo-1596435707700-6264292b861d?auto=format&fit=crop&q=80&w=600`;
                  }}
                />
                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <p className="text-white font-serif tracking-widest uppercase text-sm">
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
        <h3 className="text-2xl md:text-4xl font-black mb-6">Experience the Glow</h3>
        <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl mx-auto">
          Discover our signature collection and find the perfect scent for your
          sanctuary.
        </p>
        <div className="flex justify-center gap-4">
        <MainBtn path="/collections/candles" text={" Shop All Candles"} className="!bg-black !text-white" />
        </div>
      </section>
    </>
  );
};

export default OurStory;
