import React from "react";
import SEO from "../components/SEO";
import Hero from "../components/sections/Hero";
import About from "../components/sections/About";
import Shop from "../components/sections/Shop";
import Customized from "../components/sections/Customized";
import Instagram from "../components/sections/Instagram";

const Home = () => {
  return (
    <>
      <SEO 
        title="Naisha Creations | Premium Artisanal Candles" 
        description="Discover our premium handcrafted artisanal candles made with natural soy wax and exquisite fragrances." 
      />
      <Hero />
      <Shop />
      <Customized />
      <About />
      <Instagram />
    </>
  );
};

export default Home;
