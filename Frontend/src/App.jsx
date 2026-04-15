import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/layout/Navbar/Navbar'
import { useRef, useEffect, lazy, Suspense } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Footer from './components/layout/Footer/Footer';
import Wishlist from './pages/Wishlist'
import { Toaster } from 'react-hot-toast'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import ShopDetails from './pages/ShopDetails'
import MainAbout from './components/sections/OurStory'
import OurStory from './components/sections/OurStory'
import Shop from './components/sections/Shop'
import Candles from './pages/Candles'

// Lazy loading pages for performance optimization
const Home = lazy(() => import('./pages/Home'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// Simple loading indicator for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-coffee border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const contactRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
    const smoother = ScrollSmoother.create({
      content: "#smooth-content",
      smooth: 1.2,
      effects: true
    })
    return () => {
      smoother && smoother.kill()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, []);


  return (
    <>
      <div id="smooth-wrapper">
        <Navbar />
        <div id="smooth-content">
          <div className="min-h-screen flex flex-col overflow-clip">
            <main className="flex-grow">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout/>} />
                  <Route path="/product/:id" element={<ShopDetails/>} />
                  <Route path="/about" element={<OurStory/>} />
                  <Route path="/candles" element={<Candles/>} />

                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </div>
      </div>
     <Toaster position='top-right' />
    </>
  )
}

export default App
