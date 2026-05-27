import React from "react";
import Hero from "../components/sections/Hero";
import About from "../components/sections/About";
import Shop from "../components/sections/Shop";
import Customized from "../components/sections/Customized";
import Instagram from "../components/sections/Instagram";

const Home = () => {
  return (
    <>
      <Hero />
      <Shop />
      <Customized />
      <About />
      <Instagram />
    </>
  );
};

export default Home;
