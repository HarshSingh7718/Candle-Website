import React, { useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom"; // Note the new imports
import PageBanner from "../components/ui/PageBanner";
import Loader from "../components/ui/Loader";
import SEO from '../components/SEO';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Loader2,
  User,
  Package,
  Heart,
  Sparkles,
  MapPin,
  LogOut,
} from "lucide-react";
import { useUser, useLogout } from "../hooks/useAuth";

gsap.registerPlugin(ScrollTrigger);

const MyAccount = () => {
  const accountRef = useRef();
  const { data: user, isLoading } = useUser();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !accountRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".account-card", {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: ".account-section", start: "top 85%" },
      });
    }, accountRef);
    return () => ctx.revert();
  }, [isLoading]);

  if (isLoading) {
    return <Loader />;
  }

  // NavLink automatically provides an 'isActive' boolean via a render prop!
  const navLinkClass = ({ isActive }) => {
    const baseClass =
      "flex items-center gap-3 transition-colors block pl-3 py-2 cursor-pointer border-l-2 text-left w-full ";
    return isActive
      ? baseClass + "font-medium text-text-base border-text-base"
      : baseClass + "text-paragraph hover:text-black border-transparent";
  };

  return (
    <>
    <SEO
      title="My Account - Naisha Creations"
      description="Manage your profile, orders, saved addresses and wishlist at Naisha Creations."
    />
      <PageBanner title="My Account" currentPage="My Account" />
      <div
        ref={accountRef}
        className="container mx-auto py-[8%] px-4 account-section min-h-[60vh]"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Sidebar Navigation */}
          <div className="col-span-1 account-card">
            <div className="bg-bg-surface-hover p-6 border border-bg-muted sticky top-24 rounded-sm">
              <h3 className="text-xl font-semibold mb-2 text-heading truncate">
                Hello, {user?.firstName}!
              </h3>

              <ul className="space-y-2">
                {/* Use end to ensure it only matches exactly /account, not /account/orders */}
                <li>
                  <NavLink to="/account" end className={navLinkClass}>
                    <User size={18} /> Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/account/orders" className={navLinkClass}>
                    <Package size={18} /> Order History
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/account/wishlist" className={navLinkClass}>
                    <Heart size={18} /> Wishlist
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/account/addresses" className={navLinkClass}>
                    <MapPin size={18} /> Addresses
                  </NavLink>
                </li>

                <li className="pt-4 mt-4 border-t border-bg-muted">
                  <button
                    onClick={() =>
                      logoutMutation.mutate(null, {
                        onSuccess: () => navigate("/"),
                      })
                    }
                    className="flex items-center gap-3 text-danger hover:text-red-700 transition-colors block pl-3 py-2 cursor-pointer w-full text-left"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content Area (Dynamic via React Router) */}
          <div className="col-span-1 md:col-span-3 account-card">
            {/* 
                            This is the magic component. React Router will automatically 
                            inject OrdersTab, WishlistTab, etc., right here based on the URL!
                        */}
            <Outlet context={{ user }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAccount;
