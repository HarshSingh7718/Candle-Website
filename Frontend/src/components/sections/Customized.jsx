import React from 'react';
import MainBtn from '../ui/Buttons/MainBtn';

const Customized = () => {
  return (
    <section id="customized" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <img 
              src="/images/Index/Hero/main-slider-02.jpg" 
              alt="Customized Candles" 
              className="rounded-lg shadow-xl w-full h-[500px] object-cover"
              loading="lazy"
            />
          </div>
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl font-bold text-coffee uppercase tracking-widest">Bespoke Creations</h2>
            <h3 className="text-2xl font-semibold text-gray-800 italic">Tailored for your most precious moments.</h3>
            <p className="text-gray-600 leading-relaxed text-lg text-justify">
              At Naisha Creations, we believe every occasion deserves a unique glow. Whether it's a wedding, a corporate event, or a personal gift, we offer bespoke candle customization services. Choose your fragrance, vessel, and personalized branding to create something truly one-of-a-kind.
            </p>
            <div className="pt-4">
              <MainBtn 
                text="Custom Orders" 
                path="/contact" 
                className="!bg-black !text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Customized;
