import React from 'react'
import { Link,NavLink } from 'react-router-dom'

import { 
  X, 
  ChevronDown, 
  Share2, 
  Camera, 
  Send, 
  Globe,
  Copyright
} from 'lucide-react'
import Logo from "./Logo"



const MobileMenu = ({ menuOpen, setMenuOpen, navLinks }) => {
    const [activeMenu, setActiveMenu] = React.useState(null);
    const year = new Date().getFullYear();

    const handleMenuClick = (index) => {
        setActiveMenu(activeMenu === index ? null : index);
    };

    return (
        <>
            <div className={`z-50 fixed top-0 left-0 w-full bg-black text-white overflow-hidden transition-all duration-500 px-[2%] md:px-[8%] xl:px-[12%] ${menuOpen ?"h-screen opacity-100":"h-0 opacity-0"}`}>
             <div className="flex justify-between items-center py-5 border-b border-gray-50/20">
             <Logo/>
             <div className="">
                <button onClick={()=> setMenuOpen(false)} className='text-white flex gap-2'>
                    <span>Close</span>
                    <X size={25}/>
                </button>
             </div>

             </div>
              <div className="flex flex-col items-center gap-6 text-xl mt-10">
                {navLinks.map((items,index)=>(
                    <div key={index} className="w-full text-center">
                        {items.submenu ?(
                            <button onClick={()=> handleMenuClick(index)} className='flex items-center justify-center gap-2 w-full text-white relative ms-3'>

                                {items.name}
                                <ChevronDown className={`transition-transform duration-300 ${activeMenu === index ? "rotate-180":""}`} />
                            </button>
                        ):(
                            <NavLink to={items.path}
                            onClick={()=> setMenuOpen(false)}
                            className="block">
                                {items.name}
                            
                            </NavLink>
                        )}

                        {items.submenu &&(
                            <div className={`overflow-hidden transition-all duration-500 ${activeMenu===index  ? "max-h-60 mt-4":"max-h-0"}`}>
                                <div className="flex flex-col gap-3">
                                    {items.submenu.map((sub,i)=>(
 <NavLink key={i}
                                    to={sub.path}
                                    onClick={()=>setMenuOpen(false)} className="text-gray-300 hover:text-white">
                                        {sub.name}
                                    </NavLink>
                                    ))}
                                   
                                </div>
                            </div>
                        )}
                    </div>
                ))}
              </div>

              <hr className='mt-8 text-gray-50/20'/>
            {/* Social Icons */}
            <ul className='max-auto flex items-center justify-center py-5 gap-3'>
                <li>
                    <Link to="/" className='p-3 rounded-full bg-linear-to-r from-blue-500 to-blue-700 transition-all duration-300 rotate-hover inline-block'>
                    <Share2 className="text-white" size={20}/>
                    </Link>
                </li>

                <li>
                    <Link to="/" className='p-3 rounded-full bg-linear-to-r from-sky-500 to-blue-700 transition-all duration-300 rotate-hover inline-block'>
                    <Send className="text-white" size={20}/>
                    </Link>
                </li>

               

                 <li>
                    <Link to="/" className='p-3 rounded-full bg-linear-to-r from-pink-500 via-red-700 to-yellow-500 transition-all duration-300 rotate-hover inline-block'>
                    <Camera className="text-white" size={20}/>
                    </Link>
                </li>
                 <li>
                    <Link to="/" className='p-3 rounded-full bg-linear-to-r from-purple-500 to-pink-700 transition-all duration-300 rotate-hover inline-block'>
                    <Globe className="text-white" size={20}/>
                    </Link>
                </li>
            </ul>
            <div className="absolute bottom-5 left-0 w-full text-center space-y-4">
                <p className='text-sm text-gray-400 flex items-center justify-center gap-1'>
                    <Copyright size={16}/>
                    <span>{year}your Company ,All Rights Reserved.</span>
                </p>
            </div>
            </div>
        </>
    )
}

export default MobileMenu
