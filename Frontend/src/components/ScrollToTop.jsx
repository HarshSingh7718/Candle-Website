import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ScrollToTop = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const scrollPosRef = useRef(0);

  // Track scroll position continuously to avoid stale reads on unmount
  useEffect(() => {
    const handleScroll = () => {
      scrollPosRef.current = window.scrollY;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Save for the current location key before it changes
      sessionStorage.setItem(`scroll-${location.key}`, String(scrollPosRef.current));
    };
  }, [location.key]);

  // Restore or reset scroll position on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
      const smoother = ScrollSmoother.get();

      if (navType === "POP") {
        const savedScroll = sessionStorage.getItem(`scroll-${location.key}`);
        const targetScroll = savedScroll ? parseInt(savedScroll, 10) : 0;
        
        if (smoother) {
          smoother.scrollTo(targetScroll, false);
        } else {
          window.scrollTo(0, targetScroll);
        }
      } else {
        if (smoother) {
          smoother.scrollTo(0, false);
        } else {
          window.scrollTo(0, 0);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.key, navType]);

  // Backstop: Observe #smooth-content for async layout shifts
  useEffect(() => {
    const contentNode = document.getElementById("smooth-content");
    if (!contentNode) return;

    // Use ResizeObserver to refresh GSAP bounds whenever content height changes (e.g., images loading)
    const resizeObserver = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });

    resizeObserver.observe(contentNode);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return null;
};

// Helper for programmatic scrolling within a page (e.g., filter changes)
export const scrollToTarget = (target, offset = "top top", smooth = true) => {
  const smoother = ScrollSmoother.get();
  if (smoother && target) {
    smoother.scrollTo(target, smooth, offset);
  } else if (target && typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }
};

export default ScrollToTop;