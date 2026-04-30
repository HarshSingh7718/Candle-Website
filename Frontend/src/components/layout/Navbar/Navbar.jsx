import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, TextAlignJustify, User, Search, LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Custom Components & Hooks
import Logo from './Logo';
import NavMenu from './NavMenu';
import MobileMenu from './MobileMenu';
import GlobalSearch from './GlobalSearch';
import { useUser, useLogout } from '../../../hooks/useAuth';
import { useCart } from '../../../hooks/useCart';
import API from '../../../api';

const navLinks = [
  { name: "Candles", path: "/collections/candles" },
  { name: "Our Story", path: "/about" },
  { name: "Collections", path: "/collections" },
  { name: "Customized", path: "/customized" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { data: user } = useUser();
  const { cart } = useCart();
  const queryClient = useQueryClient();
  
  const location = useLocation();
  const navigate = useNavigate();

  // Handle Scroll
  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <div className={`w-full z-50 fixed top-0 left-0 transition-all duration-300 ${is404 ? "bg-black text-white" : scroll ? "bg-black shadow-lg" : "bg-transparent"}`}>
        <div className="container mx-auto flex justify-between items-center h-19 md:h-22 px-4">
          
          <NavLink to="/">
            <Logo />
          </NavLink>

          <div className="centered-row justify-start gap-12">
            {/* Desktop Navigation - All items now use NavMenu */}
            <div className="hidden lg:flex items-center gap-8">
                {navLinks.map((item, index) => (
                    <NavMenu key={index} name={item.name} path={item.path} />
                ))}
            </div>
            
            <div className="nav-icons flex items-center gap-3">
              <button onClick={() => setIsSearchOpen(true)} className='cursor-pointer'>
                <Search size={24} className='text-white cursor-pointer' />
              </button>


              <Link to='/cart' className='relative'>
                <ShoppingBag size={24} className='text-white cursor-pointer' />
                {cart?.length > 0 && (
                  <span className='card-count'>{cart.length}</span>
                )}
              </Link>

              <div className="relative">
                {user ? (
                  <button 
                    onClick={() => setShowUserDropdown(!showUserDropdown)} 
                    onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                    className='user cursor-pointer flex items-center'
                  >
                    <User size={24} className='text-white cursor-pointer' />
                  </button>
                ) : (
                  <Link to="/signin" className='user cursor-pointer flex items-center'>
                    <User size={24} className='text-white cursor-pointer' />
                  </Link>
                )}

                <div 
                  className={`absolute right-[-4px] top-12 w-[180px] bg-white rounded-md shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-gray-100 transition-all duration-200 transform origin-top-right ${showUserDropdown ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}
                >
                  <div className="absolute -top-1.5 right-[14px] w-3 h-3 bg-white transform rotate-45 border-t border-l border-gray-100 box-border z-[1]"></div>
                  
                  <div className="py-2.5 relative z-10 flex flex-col">
                    <Link to="/account" className="flex items-center gap-3 px-5 py-2.5 text-[15px] text-[#333] hover:bg-gray-50 transition-colors">
                      <User size={18} strokeWidth={1.5} className="text-[#333]" /> My Account
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-5 py-2.5 text-[15px] text-[#333] hover:bg-gray-50 transition-colors">
                      <ShoppingBag size={18} strokeWidth={1.5} className="text-[#333]" /> Orders
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3 px-5 py-2.5 text-[15px] text-[#333] hover:bg-gray-50 transition-colors">
                      <Heart size={18} strokeWidth={1.5} className="text-[#333]" /> Wishlist
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-[15px] text-[#333] hover:bg-gray-50 transition-colors text-left"
                    >
                      <LogOut size={18} strokeWidth={1.5} className="text-[#333]" /> Logout
                    </button>
                  </div>
                </div>
              </div>

              <button className='relative ms-2 lg:hidden block' onClick={() => setMenuOpen(true)}>
                <TextAlignJustify size={24} className='text-white cursor-pointer' />
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} navLinks={navLinks} />
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;