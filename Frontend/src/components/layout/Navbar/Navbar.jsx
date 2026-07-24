import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, TextAlignJustify, User, Search, LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Custom Components & Hooks
import Logo from './Logo';
import NavMenu from './NavMenu';
import MobileMenu from './MobileMenu';
import GlobalSearch from './GlobalSearch';
import CartDrawer from './CartDrawer';
import { useUser, useLogout } from '../../../hooks/useAuth';
import { useCart } from '../../../hooks/useCart';
import { getGuestCart } from '../../../utils/guestCart';
import API from '../../../api';

const navLinks = [
  { name: "Candles", path: "/collections/candles" },
  { name: "Collections", path: "/collections" },
  { name: "Customized", path: "/customized" },
  { name: "Contact", path: "/contact" },
  { name: "Our Story", path: "/about" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const { data: user } = useUser();
  const { cart } = useCart();
  const queryClient = useQueryClient();
  const cartCount = user ? cart?.length || 0 : getGuestCart().length;
  
  const location = useLocation();
  const navigate = useNavigate();

  // Handle Scroll
  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for global cart open events (from Cart page redirect or elsewhere)
  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  // Close all navbar overlays on route change
  useEffect(() => {
    setIsCartOpen(false);
    setIsSearchOpen(false);
    setMenuOpen(false);
    setShowUserDropdown(false);
  }, [location.pathname]);

  const logoutMutation = useLogout();

  // 2. Replace your old handleLogout with this clean version
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // Only UI logic goes here now!
        setShowUserDropdown(false);
        toast.success("Logged out successfully");
        navigate("/signin");
      },
      onError: () => {
        toast.error("Logout failed");
      }
    });
  };

  const is404 = location.pathname === "/PATH404";
  const isAuthPage = ['/signin', '/register', '/forgot-password', '/verify-otp'].includes(location.pathname);

  if (isAuthPage) return null;

  return (
    <>
      <div className={`w-full z-50 fixed top-0 left-0 transition-all duration-300 ${is404 ? "bg-primary text-light-yellow" : "bg-primary shadow-lg" }`}>
        <div className="container mx-auto flex justify-between items-center h-19 md:h-22 px-4">
          
          <Logo />

          <div className="centered-row justify-start gap-5 xl:gap-12">
            {/* Desktop Navigation - All items now use NavMenu */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-8">
                {navLinks.map((item, index) => (
                    <NavMenu key={index} name={item.name} path={item.path} />
                ))}
            </div>
            
            <div className="nav-icons flex items-center gap-3">
              <button onClick={() => setIsSearchOpen(true)} className='cursor-pointer'>
                <Search size={24} className='text-light-yellow cursor-pointer' />
              </button>


              <button 
                onClick={() => {
                  if (user) {
                    navigate('/cart');
                  } else {
                    setIsCartOpen(true);
                  }
                }} 
                className='relative cursor-pointer'
              >
                <ShoppingBag size={24} className='text-light-yellow cursor-pointer' />
                {cartCount > 0 && (
                  <span className='card-count'>{cartCount}</span>
                )}
              </button>

              <div 
                className="relative"
                onMouseEnter={() => {
                  if (user) {
                    clearTimeout(hoverTimeoutRef.current);
                    setShowUserDropdown(true);
                  }
                }}
                onMouseLeave={() => {
                  hoverTimeoutRef.current = setTimeout(() => setShowUserDropdown(false), 200);
                }}
              >
                {user ? (
                  <button 
                    onClick={() => setShowUserDropdown(!showUserDropdown)} 
                    className='user cursor-pointer flex items-center'
                  >
                    <User size={24} className='text-light-yellow cursor-pointer' />
                  </button>
                ) : (
                  <Link to="/signin" className='user cursor-pointer flex items-center'>
                    <User size={24} className='text-light-yellow cursor-pointer' />
                  </Link>
                )}

                <div className={`absolute right-[-4px] top-12 w-[180px] bg-light-yellow rounded-md shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-muted/20 transition-all duration-200 transform origin-top-right ${showUserDropdown ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
                  <div className="absolute -top-1.5 right-[14px] w-3 h-3 bg-light-yellow transform rotate-45 border-t border-l border-muted/20 box-border z-[1]"></div>
                  
                  <div className="py-2.5 relative z-10 flex flex-col">
                    <Link to="/account" className="flex items-center gap-3 px-5 py-2.5 text-[15px] text-heading hover:bg-coffee/10 transition-colors">
                      <User size={18} strokeWidth={1.5} className="text-heading" /> My Account
                    </Link>
                    <Link to="/account/orders" className="flex items-center gap-3 px-5 py-2.5 text-[15px] text-heading hover:bg-coffee/10 transition-colors">
                      <ShoppingBag size={18} strokeWidth={1.5} className="text-heading" /> Orders
                    </Link>
                    <Link to="/account/wishlist" className="flex items-center gap-3 px-5 py-2.5 text-[15px] text-heading hover:bg-coffee/10 transition-colors">
                      <Heart size={18} strokeWidth={1.5} className="text-heading" /> Wishlist
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-[15px] text-heading hover:bg-coffee/10 transition-colors text-left"
                    >
                      <LogOut size={18} strokeWidth={1.5} className="text-heading" /> Logout
                    </button>
                  </div>
                </div>
              </div>

              <button className='relative ms-2 lg:hidden block' onClick={() => setMenuOpen(true)}>
                <TextAlignJustify size={24} className='text-light-yellow cursor-pointer' />
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} navLinks={navLinks} />
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;