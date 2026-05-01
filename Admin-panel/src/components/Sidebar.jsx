import { useEffect, useRef } from "react";
import gsap from "gsap";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const sidebarRef = useRef(null);
  const linksRef = useRef([]);

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

  return (
    <nav
      ref={sidebarRef}
      className={`bg-stone-50 dark:bg-black text-amber-700 dark:text-amber-500 font-heading text-base tracking-tight h-screen w-64 border-r fixed left-0 top-0 border-stone-200 dark:border-stone-800 shadow-[4px_0_24px_-12px_rgba(217,119,6,0.15)] flex-col py-3 space-y-2 overflow-y-auto z-50 flex transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      <div className="px-6 mb-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden flex-shrink-0">
          <img
            alt="Store Logo"
            className="w-full h-[85%] object-cover"
            src="./logo.png"
          />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold text-stone-800 dark:text-stone-100">
            Naisha Admin
          </h1>
          <p className="text-sm text-stone-500 dark:text-white">
            Premium Candles 
          </p>
        </div>
        {/* Close Button on Mobile */}
        <button 
          className="md:hidden ml-auto text-stone-500 hover:text-stone-800 p-1"
          onClick={() => setIsOpen(false)}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div 
        className="flex-1 space-y-1"
        onClick={(e) => { if (e.target.closest('a')) setIsOpen(false); }}
      >
        <NavLink
          ref={addToRefs}
          to="/dashboard"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 ${isActive ? 'text-amber-800 dark:text-amber-400 font-bold bg-stone-100 dark:bg-stone-900 rounded-r-full border-l-4 border-amber-600' : 'text-stone-500 dark:text-white hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900'} active:scale-95 transform transition-all duration-200`}
        >
          <span className="material-symbols-outlined fill">dashboard</span>
          Dashboard
        </NavLink>
        <NavLink
          ref={addToRefs}
          to="/banners"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 ${isActive ? 'text-amber-800 dark:text-amber-400 font-bold bg-stone-100 dark:bg-stone-900 rounded-r-full border-l-4 border-amber-600' : 'text-stone-500 dark:text-white hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900'} active:scale-95 transform transition-all duration-200`}
        >
          <span className="material-symbols-outlined fill">view_carousel</span>
          Banners
        </NavLink>
        <NavLink
          ref={addToRefs}
          to="/inventory"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 ${isActive ? 'text-amber-800 dark:text-amber-400 font-bold bg-stone-100 dark:bg-stone-900 rounded-r-full border-l-4 border-amber-600' : 'text-stone-500 dark:text-white hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900'} active:scale-95 transform transition-all duration-200`}
        >
          <span className="material-symbols-outlined">inventory_2</span>
          Inventory
        </NavLink>
        <NavLink
          ref={addToRefs}
          to="/categories"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 ${isActive ? 'text-amber-800 dark:text-amber-400 font-bold bg-stone-100 dark:bg-stone-900 rounded-r-full border-l-4 border-amber-600' : 'text-stone-500 dark:text-white hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900'} active:scale-95 transform transition-all duration-200`}
        >
          <span className="material-symbols-outlined">category</span>
          Categories
        </NavLink>
        <NavLink
          ref={addToRefs}
          to="/reviews"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 ${isActive ? 'text-amber-800 dark:text-amber-400 font-bold bg-stone-100 dark:bg-stone-900 rounded-r-full border-l-4 border-amber-600' : 'text-stone-500 dark:text-white hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900'} active:scale-95 transform transition-all duration-200`}
        >
          <span className="material-symbols-outlined">rate_review</span>
          Reviews
        </NavLink>
        <NavLink
          ref={addToRefs}
          to="/orders"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 ${isActive ? 'text-amber-800 dark:text-amber-400 font-bold bg-stone-100 dark:bg-stone-900 rounded-r-full border-l-4 border-amber-600' : 'text-stone-500 dark:text-white hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900'} active:scale-95 transform transition-all duration-200`}
        >
          <span className="material-symbols-outlined">shopping_bag</span>
          Orders
        </NavLink>
       
       
        <NavLink
          ref={addToRefs}
          to="/contacts"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 ${isActive ? 'text-amber-800 dark:text-amber-400 font-bold bg-stone-100 dark:bg-stone-900 rounded-r-full border-l-4 border-amber-600' : 'text-stone-500 dark:text-white hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900'} active:scale-95 transform transition-all duration-200`}
        >
          <span className="material-symbols-outlined">contact_support</span>
          Contacts
        </NavLink>
        <NavLink
          ref={addToRefs}
          to="/options"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 ${isActive ? 'text-amber-800 dark:text-amber-400 font-bold bg-stone-100 dark:bg-stone-900 rounded-r-full border-l-4 border-amber-600' : 'text-stone-500 dark:text-white hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900'} active:scale-95 transform transition-all duration-200`}
        >
          <span className="material-symbols-outlined">settings</span>
          Options
        </NavLink>
      </div>
      <div 
        className="mt-auto space-y-1 pt-8 border-t border-stone-200 mx-4"
        onClick={(e) => { if (e.target.closest('a')) setIsOpen(false); }}
      >
        
        <NavLink
          ref={addToRefs}
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 text-stone-500 dark:text-white hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 transition-all duration-200 active:scale-95 transform transition-transform"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </NavLink>
      </div>
    </nav>
  );
};

export default Sidebar;
