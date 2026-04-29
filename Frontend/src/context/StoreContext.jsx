import { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [homeData, setHomeData] = useState({
    banners: [],
    featured: [],
    trending: [],
    latest: [],
    bestSeller: [],
    discounted: [],
    rawProducts: []
  });
  const [loading, setLoading] = useState(true);

  // 1. Initial Load: Auth Check & Home Data
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      try {
        // Fetch User Profile (if logged in via cookies)
        const userRes = await API.get("/user/profile");
        if (userRes.data.success) {
          setUser(userRes.data.user);
        }

        // Fetch Categories
        const catRes = await API.get("/categories");
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }

        // Fetch All Home Sections (Banners, Featured, etc.)
        const homeRes = await API.get("/home");
        if (homeRes.data.success) {
          setHomeData({
            banners: homeRes.data.banners,
            featured: homeRes.data.featured,
            trending: homeRes.data.trending,
            latest: homeRes.data.latest,
            bestSeller: homeRes.data.bestSeller,
            discounted: homeRes.data.discounted,
            rawProducts: homeRes.data.rawProducts
          });
        }
      } catch (error) {
        console.error("Error initializing app data:", error);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  // 2. Fetch Cart specifically (helpful for Navbar updates)
  const refreshCart = async () => {
    if (!user) return;
    try {
      const { data } = await API.get("/cart/getcart");
      if (data.success) setCart(data.cart);
    } catch (err) {
      console.error("Cart refresh error:", err);
    }
  };

  // Sync cart state when user logs in
  useEffect(() => {
    if (user) refreshCart();
    else setCart([]);
  }, [user]);

  const value = {
    user,
    setUser,
    cart,
    setCart,
    categories,
    homeData,
    loading,
    refreshCart
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook for easier usage
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};