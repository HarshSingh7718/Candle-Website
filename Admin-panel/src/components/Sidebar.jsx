import { useEffect, useRef } from "react";
import gsap from "gsap";
import { NavLink } from "react-router-dom";
import { X, LogOut, LayoutDashboard, GalleryHorizontal, Package, Tags, Star, ShoppingBag, HelpCircle, Ticket, Settings, Users, BarChart3, Settings2 } from 'lucide-react';
import { useAdminLogout } from "../hooks/useAdminAuth";

// 👉 Pro-tip: Keep your links in an array to make the component super clean and easy to edit!
const NAV_LINKS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/banners", icon: GalleryHorizontal, label: "Banners" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/categories", icon: Tags, label: "Categories" },
  { to: "/options", icon: Settings, label: "Options" },
  { to: "/orders", icon: ShoppingBag, label: "Orders" },
  { to: "/coupons", icon: Ticket, label: "Coupons" },
  { to: "/reviews", icon: Star, label: "Reviews" },
  { to: "/contacts", icon: HelpCircle, label: "Contacts" },
  { to: "/users", icon: Users, label: "Users" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/setting", icon: Settings2, label: "Settings" },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const sidebarRef = useRef(null);
  const linksRef = useRef([]);
  const { mutate: logout, isPending } = useAdminLogout();

  // Sidebar link entrance animation
  useEffect(() => {
    gsap.fromTo(
      linksRef.current,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.2,
      },
    );
  }, []);

  const addToRefs = (el) => {
    if (el && !linksRef.current.includes(el)) {
      linksRef.current.push(el);
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <nav
        ref={sidebarRef}
        className={`bg-brand-primary text-text-on-brand font-heading text-base tracking-tight h-screen w-64 border-r fixed left-0 top-0 border-coffee-800 flex-col pb-3 space-y-2 hide-scrollbar overflow-y-auto z-50 flex transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="px-6 py-5 mb-8 flex items-center gap-4 bg-coffee-950 border-b border-coffee-800">
          <div className="w-7 md:w-10  h-7 md:h-10 rounded-full bg-bg-muted overflow-hidden flex-shrink-0 shadow-sm border border-stone-200 dark:border-stone-800">
            <a href="/setting">
              <img
                alt="Administrator profile"
                className="w-full h-full object-cover cursor-pointer"
                src="/favicon/favicon.svg"
              />
            </a>
          </div>
          <div>
            <a href="/setting">
              <h1 className="font-heading text-sm md:text-lg font-bold text-text-on-brand leading-tight">
                Naisha Admin
              </h1>
            </a>
          </div>
          {/* Close Button strictly visible only on mobile/tablet */}
          <button
            className="lg:hidden ml-auto text-coffee-200 hover:text-text-on-brand p-1 transition-colors cursor-pointer hover:scale-120 duration-200"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className="flex-1 space-y-1"
          onClick={(e) => {
            if (e.target.closest("a")) setIsOpen(false);
          }}
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              ref={addToRefs}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 mx-2 rounded-r-full border-l-4 transition-all duration-200 active:scale-95 transform ${
                  isActive
                    ? "text-text-on-brand font-bold bg-coffee-800 border-brand-secondary shadow-sm"
                    : "text-coffee-200 hover:text-text-on-brand hover:bg-coffee-800 border-transparent"
                }`
              }
            >
              {/* 👉 THE FIX: Exposing isActive directly to the children via a callback function */}
              {({ isActive }) => (
                <>
                  <link.icon
                    className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-text-on-brand" : "text-coffee-200"}`}
                  />
                  {link.label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer Area (Sign Out) */}
        <div className="mt-auto space-y-1 pt-6 pb-4 border-t border-coffee-800 mx-4">
          <button
            ref={addToRefs}
            onClick={handleLogout}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-coffee-200 hover:text-danger hover:bg-bg-surface-hover/10 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : (
              <LogOut className="w-5 h-5" />
            )}
            <span className="font-label-md">
              {isPending ? "Signing out..." : "Sign Out"}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
