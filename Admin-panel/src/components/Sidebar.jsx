import { useEffect, useRef } from "react";
import gsap from "gsap";
import { NavLink } from "react-router-dom";
import { useAdminLogout } from "../hooks/useAdminAuth";

// 👉 Pro-tip: Keep your links in an array to make the component super clean and easy to edit!
const NAV_LINKS = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/banners", icon: "view_carousel", label: "Banners" },
  { to: "/inventory", icon: "inventory_2", label: "Inventory" },
  { to: "/categories", icon: "category", label: "Categories" },
  { to: "/reviews", icon: "rate_review", label: "Reviews" },
  { to: "/orders", icon: "shopping_bag", label: "Orders" },
  { to: "/contacts", icon: "contact_support", label: "Contacts" },
  { to: "/options", icon: "settings", label: "Options" },
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
      { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: "power2.out", delay: 0.2 }
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
        className={`bg-stone-50 dark:bg-black text-orange-700 dark:text-orange-500 font-heading text-base tracking-tight h-screen w-64 border-r fixed left-0 top-0 border-stone-200 dark:border-stone-800 shadow-[4px_0_24px_-12px_rgba(217,119,6,0.15)] flex-col py-3 space-y-2 hide-scrollbar overflow-y-auto z-50 flex transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="px-6 mb-8 mt-2 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden flex-shrink-0 shadow-sm border border-stone-200 dark:border-stone-800">
            <img
              alt="Store Logo"
              className="w-full h-full object-cover"
              src="/logo.png"
            />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-stone-800 dark:text-stone-100 leading-tight">
              Naisha Admin
            </h1>
            <p className="text-[11px] font-bold tracking-widest text-stone-500 dark:text-stone-400 uppercase">
              Premium Candles
            </p>
          </div>
          {/* Close Button strictly visible only on mobile/tablet */}
          <button
            className="lg:hidden ml-auto text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 p-1 transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className="flex-1 space-y-1"
          onClick={(e) => { if (e.target.closest('a')) setIsOpen(false); }}
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              ref={addToRefs}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 mx-2 rounded-r-full border-l-4 transition-all duration-200 active:scale-95 transform ${isActive
                  ? 'text-orange-800 dark:text-orange-400 font-bold bg-stone-100 dark:bg-stone-900 border-orange-600 shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 border-transparent'
                }`
              }
            >
              {/* 👉 THE FIX: Exposing isActive directly to the children via a callback function */}
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-[22px] ${isActive ? 'fill' : ''}`}>
                    {link.icon}
                  </span>
                  {link.label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer Area (Sign Out) */}
        <div className="mt-auto space-y-1 pt-6 pb-4 border-t border-stone-200 dark:border-stone-800 mx-4">
          <button
            ref={addToRefs}
            onClick={handleLogout}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-stone-500 dark:text-stone-400 hover:text-error dark:hover:text-error-container hover:bg-error/10 dark:hover:bg-error/20 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : (
              <span className="material-symbols-outlined text-[22px]">logout</span>
            )}
            <span className="font-label-md">{isPending ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;