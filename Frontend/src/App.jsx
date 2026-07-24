import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import Navbar from "./components/layout/Navbar/Navbar";
import { useRef, useEffect, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { Toaster } from "react-hot-toast";
import { trackPageView } from "./utils/metaPixel";
import Footer from "./components/layout/Footer/Footer";
import SEO from "./components/SEO/index.jsx";
import CompleteGoogleProfile from "./pages/CompleteGoogleProfile";
import MyAccount from "./pages/MyAccount";
import Wishlist from "./components/sections/account/Wishlist";
import Orders from "./components/sections/account/Orders";
import Profile from "./components/sections/account/Profile";
import Addresses from "./components/sections/account/Addresses";
import ViewOrder from "./components/sections/account/ViewOrder";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ShopDetails from "./pages/ShopDetails";
import MainAbout from "./components/sections/OurStory";
import OurStory from "./components/sections/OurStory";
import Shop from "./components/sections/Shop";
import Candles from "./pages/Candles";
import Contact from "./components/sections/Contact";
import Customized from "./pages/Customized";
import Collections from "./components/sections/Collections";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import TermsOfServicePage from "./pages/TermsOfService";
import NotFound from './pages/NotFound';


// Fix GSAP target not found errors globally
gsap.config({ nullTargetWarn: false });

// Lazy loading pages for performance optimization
const Home = lazy(() => import("./pages/Home"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Register = lazy(() => import("./pages/Register"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const ReturnRefundPolicy = lazy(() => import("./pages/ReturnRefundPolicy"));

// Simple loading indicator for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-text-base flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-coffee border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const contactRef = useRef(null);

  const location = useLocation();

  const authPages = [
    "/signin",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
    "/complete-google-profile",
  ];

  useEffect(() => {
    trackPageView();

    // ── Unlock body scroll & unpause ScrollSmoother on route change ──
    document.body.style.overflow = "";
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.paused(false);
      smoother.scrollTo(0, false);
    } else {
      window.scrollTo(0, 0);
    }

    // Refresh ScrollTrigger so wrapper height updates for new page content
    const timer = setTimeout(() => {
      const currentSmoother = ScrollSmoother.get();
      if (currentSmoother) {
        currentSmoother.paused(false);
      }
      ScrollTrigger.refresh();
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const hasNavbarSpacing = !authPages.includes(location.pathname);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    const smoother = ScrollSmoother.create({
      content: "#smooth-content",
      smooth: 1.2,
      effects: true,
    });
    return () => {
      smoother && smoother.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const globalSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Naisha Creations",
        "url": "https://naishacreations.com"
      },
      {
        "@type": "WebSite",
        "name": "Naisha Creations",
        "url": "https://naishacreations.com"
      }
    ]
  };

  return (
    <>
      <SEO schema={globalSchema} />
      <div id="smooth-wrapper">
        <Navbar />
        <div id="smooth-content">
          <div className={`min-h-screen flex flex-col overflow-clip ${hasNavbarSpacing ? "pt-19 md:pt-22" : ""
            }`}>
            <main className="flex-grow">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/collections/candles/product/:slug"
                    element={<ShopDetails />}
                  />
                  <Route path="/about" element={<OurStory />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/term-of-service" element={<TermsOfServicePage />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
                  <Route path="/collections/candles" element={<Candles />} />
                  <Route path="/customized" element={<Customized />} />
                  <Route path="/collections" element={<Collections />} />

                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-otp" element={<VerifyOTP />} />


                  {/* === PROTECTED ROUTES === */}
                  <Route element={<ProtectedRoute />}>
                    <Route
                      path="/complete-google-profile"
                      element={<CompleteGoogleProfile />}
                    />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/account" element={<MyAccount />}>
                      <Route index element={<Profile />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="wishlist" element={<Wishlist />} />
                      <Route path="addresses" element={<Addresses />} />
                      <Route path="orders/:orderId" element={<ViewOrder />} />
                    </Route>
                  </Route>
                  {/* 404 page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </div>
      </div>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#3d2424',
            color: '#fce8e8',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fce8e8' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fce8e8' } },
        }}
        containerStyle={{ bottom: 24, zIndex: 999999 }}
      />
    </>
  );
}

export default App;
