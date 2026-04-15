import React from 'react'
import Logo from './Logo'
import { useState,useEffect} from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import NavDropdown from './NavDropdown';
import NavMenu from './NavMenu';
import { Heart, ShoppingBag, TextAlignJustify, User, Search } from 'lucide-react';
import MobileMenu from './MobileMenu';
import AuthModal from '../../ui/Modal/AuthModal';
import { useCart } from '../../../hooks/useCart';
import { useWishlist } from '../../../hooks/useWishlist';


// Nav Links

const navLinks = [
{ name: "Candles", path: "/candles" },
{ name: "Our Story", path: "/about" },
{
name: "Collections",
submenu: [
{ name: "Product List", path: "/#collections" },
{ name: "Product Single", path: "/product/1" },
{ name: "Cart", path: "/cart" },
{ name: "Checkout", path: "/checkout" },
{ name: "Wishlist Page", path: "/wishlist" },
],
},
{ name: "Customized", path: "/#customized" },
{ name: "Contact", path: "/#contact" },
];



const Navbar = () => {
  const [menuOpen,setMenuOpen]=useState(false);
    const {cart} = useCart();
    
    const [scroll,setScroll] = useState(false);

    useEffect(()=>{
        const handleSclroll = () =>{
            if(window.scrollY > 50)
                setScroll(true);
            else{
                setScroll(false);
            }
        }
        window.addEventListener("scroll",handleSclroll);

        return () => window.removeEventListener("scroll",handleSclroll);
    },[]);

    const location = useLocation();
    const is404 =location.pathname ==="/PATH404"
    const [openAuth,setOpenAuth]= useState(false);


  return (
    <>
    <div className={`w-full z-50 fixed top-0 left-0 transition-all duration-300 ${is404 ?"bg-black text-white":scroll ? "bg-black shadow-lg" : "bg-transparent"}`}>
        
        <div className="container mx-auto flex justify-between items-center h-22 px-4">
          
          {/* Logo */}
          <NavLink to="/">
            <Logo />
          </NavLink>

          {/* Desktop Navigation */}
          <div className="centered-row justify-center gap-12">
            <div className="hidden lg:flex items-center gap-8">
                {navLinks.map((item,index)=>(
                    item.submenu ? (
                        <NavDropdown key={index} item={item}/>
                    ):(
                        <NavMenu key={index} name={item.name} path={item.path}/>
                    )
                ))}
            </div>
            
            {/* Nav Icons */}
            <div className="nav-icons flex items-center gap-3">
              
              <button className='cursor-pointer'>
                <Search size={24} className='text-white cursor-pointer'/>
              </button>

               <Link to='/wishlist' className='relative'>
              <Heart size={24} className='text-white cursor-pointer'/>
              <span className='card-count'>0</span></Link> 

               <Link to='/cart' className='relative '>
              <ShoppingBag size={24} className='text-white cursor-pointer'/>
              {cart.length > 0 && (
    <span className='card-count'>{cart.length}</span>
)}</Link>

              <button onClick={()=> setOpenAuth(true)} className='user cursor-pointer'>
                <User size={24} className='text-white cursor-pointer'/>
              </button>

              

              <button className='relative ms-2 lg:hidden block' onClick={()=> setMenuOpen(true)}>
                <TextAlignJustify size={24} className='text-white cursor-pointer'/>
              </button>
            </div>
            
          </div>

        </div>

      </div>

      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} navLinks={navLinks} className="lg:block hidden"/>
      <AuthModal isOpen={openAuth} onClose={()=> setOpenAuth(false)}/>
    </>
  )
}

export default Navbar
