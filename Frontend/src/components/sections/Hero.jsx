import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";


import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const slide1 = "/images/Index/Hero/main-slider-01.jpg";
const slide2 = "/images/Index/Hero/main-slider-02.jpg";
const slide3 = "/images/Index/Hero/main-slider-03.jpg";
import MainBtn from "../ui/Buttons/MainBtn";
import { ChevronLeft, ChevronRight } from "lucide-react";



function Hero() {
    return (
        <>
            <section className="relative overflow-hidden" id="hero">
                <Swiper
    modules={[Autoplay, Pagination, Navigation, EffectFade]}
    effect="fade"
    autoplay={{ delay: 4000 }}
    pagination={{ clickable: true }}
    navigation={{
        nextEl: ".hero-next",
        prevEl: ".hero-prev"
    }}

loop={true}
    className="heroSwiper px-4 py-[8%]"
>
    <SwiperSlide>
        <div className="px-[4%] md:px-[8%] xl:px-[12%] py-[8%] xl:py-
        [12%] min-h-screen w-full flex flex-col justify-center
        items-center bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url(${slide1})` }}
        >
            <div className="hero-content text-white text-center">
    <h1 className="text-4xl sm:text-5xl md:text-6xl
    lg:text-7xl xl:text-8xl font-bold pb-5">Light Your
    <span className="block text-coffee w-fit
    mx-auto">Calm</span> </h1>

    <p className="max-w-4xl mx-auto pb-14 lg:pb-18
    text-gray-50 font-light text-md lg:text-lg">Experience the soothing glow of handcrafted serenity. Our premium candles are designed to transform your space into a sanctuary of peace and elegance.</p>

   <MainBtn  text={"Explore Collections"} path="/shop"
className="!w-45" />

<div className="fixed top-52 right-2 z-20 hidden md:flex flex-col gap-2"><a href="/cart"><div className="bg-white w-16 h-17.5 rounded-md flex flex-col gap-1 text-[#33475b] justify-center items-center shadow-testShadow overflow-x-hidden group cursor-pointer relative"><div className="flex justify-center items-center"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-2xl -translate-x-12 group-hover:translate-x-3 transition-transform duration-200" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 6.414L.757 3.172l1.415-1.415L5.414 5h15.242a1 1 0 0 1 .958 1.287l-2.4 8a1 1 0 0 1-.958.713H6v2h11v2H5a1 1 0 0 1-1-1V6.414zM5.5 23a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path></g></svg><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-2xl -translate-x-3 group-hover:translate-x-12 transition-transform duration-200" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 6.414L.757 3.172l1.415-1.415L5.414 5h15.242a1 1 0 0 1 .958 1.287l-2.4 8a1 1 0 0 1-.958.713H6v2h11v2H5a1 1 0 0 1-1-1V6.414zM5.5 23a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path></g></svg></div><p className="text-xs font-semibold font-titleFont">Buy Now</p><p className="absolute top-1 right-2 bg-primeColor text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-semibold">1</p></div></a></div>
</div>
        </div>
    </SwiperSlide>

      <SwiperSlide>
        <div className="px-[4%] md:px-[8%] xl:px-[12%] py-[8%] xl:py-
        [12%] min-h-screen w-full flex flex-col justify-center
        items-center bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url(${slide2})` }}
        >
            <div className="hero-content text-white text-center">
    <h1 className="text-4xl sm:text-5xl md:text-6xl
    lg:text-7xl xl:text-8xl font-bold pb-5">Soft Glow
    <span className="block text-coffee w-fit
    mx-auto">Living</span> </h1>

    <p className="max-w-4xl mx-auto pb-14 lg:pb-18
    text-gray-50 font-light text-md lg:text-lg">Discover the art of atmospheric lighting. Each candle is a masterpiece of fragrance and design, bringing a touch of luxury to every corner of your home.</p>

   <MainBtn  text={"View Collection"} path="/shop"/>
   <div className="fixed top-52 right-2 z-20 hidden md:flex flex-col gap-2"><a href="/cart"><div className="bg-white w-16 h-17.5 rounded-md flex flex-col gap-1 text-[#33475b] justify-center items-center shadow-testShadow overflow-x-hidden group cursor-pointer relative"><div className="flex justify-center items-center"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-2xl -translate-x-12 group-hover:translate-x-3 transition-transform duration-200" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 6.414L.757 3.172l1.415-1.415L5.414 5h15.242a1 1 0 0 1 .958 1.287l-2.4 8a1 1 0 0 1-.958.713H6v2h11v2H5a1 1 0 0 1-1-1V6.414zM5.5 23a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path></g></svg><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-2xl -translate-x-3 group-hover:translate-x-12 transition-transform duration-200" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 6.414L.757 3.172l1.415-1.415L5.414 5h15.242a1 1 0 0 1 .958 1.287l-2.4 8a1 1 0 0 1-.958.713H6v2h11v2H5a1 1 0 0 1-1-1V6.414zM5.5 23a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path></g></svg></div><p className="text-xs font-semibold font-titleFont">Buy Now</p><p className="absolute top-1 right-2 bg-primeColor text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-semibold">1</p></div></a></div>



</div>
        </div>
    </SwiperSlide>

     <SwiperSlide>
        <div className="px-[4%] md:px-[8%] xl:px-[12%] py-[8%] xl:py-
        [12%] min-h-screen w-full flex flex-col justify-center
        items-center bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url(${slide3})` }}
        >
            <div className="hero-content text-white text-center">
    <h1 className="text-4xl sm:text-5xl md:text-6xl
    lg:text-7xl xl:text-8xl font-bold pb-5">Elegance Every
    <span className="block text-coffee w-fit
    mx-auto">Detail</span> </h1>

    <p className="max-w-4xl mx-auto pb-14 lg:pb-18
    text-gray-50 font-light text-md lg:text-lg">Meticulously poured and thoughtfully scented. Elevate your gifting or personal rituals with our exclusive range of slow-burning, artisanal candles.</p>

   <MainBtn  text={"Get In Touch"} path="/contact"/>
   <div className="fixed top-52 right-2 z-20 hidden md:flex flex-col gap-2"><a href="/cart"><div className="bg-white w-16 h-17.5 rounded-md flex flex-col gap-1 text-[#33475b] justify-center items-center shadow-testShadow overflow-x-hidden group cursor-pointer relative"><div className="flex justify-center items-center"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-2xl -translate-x-12 group-hover:translate-x-3 transition-transform duration-200" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 6.414L.757 3.172l1.415-1.415L5.414 5h15.242a1 1 0 0 1 .958 1.287l-2.4 8a1 1 0 0 1-.958.713H6v2h11v2H5a1 1 0 0 1-1-1V6.414zM5.5 23a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path></g></svg><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-2xl -translate-x-3 group-hover:translate-x-12 transition-transform duration-200" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 6.414L.757 3.172l1.415-1.415L5.414 5h15.242a1 1 0 0 1 .958 1.287l-2.4 8a1 1 0 0 1-.958.713H6v2h11v2H5a1 1 0 0 1-1-1V6.414zM5.5 23a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path></g></svg></div><p className="text-xs font-semibold font-titleFont">Buy Now</p><p className="absolute top-1 right-2 bg-primeColor text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-semibold">1</p></div></a></div>


</div>
        </div>
    </SwiperSlide>

</Swiper>

<button className="hero-prev absolute left-6 top-1/2 -translate-y-1/2
bg-white/20 backdrop-blur-md p-3 rounded-full text-white
hover:bg-white hover:text-black transition">
    <ChevronLeft size={30} />
</button>

<button className="hero-next absolute right-6 top-1/2 -translate-y-1/2
bg-white/20 backdrop-blur-md p-3 rounded-full text-white
hover:bg-white hover:text-black transition">
    <ChevronRight size={30} />
</button>


            </section>
        </>
    )
}

export default Hero
