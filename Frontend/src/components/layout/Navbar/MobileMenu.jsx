import React from 'react'
import { Link, NavLink } from 'react-router-dom'

import {
    X,
    ChevronDown,
    Copyright
} from 'lucide-react'
import Logo from "./Logo"
import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa6';



const MobileMenu = ({ menuOpen, setMenuOpen, navLinks }) => {
    const [activeMenu, setActiveMenu] = React.useState(null);
    const year = new Date().getFullYear();

    const handleMenuClick = (index) => {
        setActiveMenu(activeMenu === index ? null : index);
    };

    return (
        <>
            <div className={`z-50 fixed top-0 left-0 w-full bg-primary text-text-on-brand overflow-hidden transition-all duration-500 px-[2%] md:px-[8%] xl:px-[12%] ${menuOpen ? "h-screen opacity-100" : "h-0 opacity-0"}`}>
                <div className="flex justify-between items-center py-5 border-b border-gray-50/20">
                    <Logo />
                    <div className="">
                        <button onClick={() => setMenuOpen(false)} className='text-text-on-brand flex gap-2'>
                            <span>Close</span>
                            <X size={25} />
                        </button>
                    </div>

                </div>
                <div className="flex flex-col items-center gap-6 text-xl mt-10">
                    {navLinks.map((items, index) => (
                        <div key={index} className="w-full text-center">
                            {items.submenu ? (
                                <button onClick={() => handleMenuClick(index)} className='flex items-center justify-center gap-2 w-full text-text-on-brand relative ms-3'>

                                    {items.name}
                                    <ChevronDown className={`transition-transform duration-300 ${activeMenu === index ? "rotate-180" : ""}`} />
                                </button>
                            ) : (
                                <NavLink to={items.path}
                                    onClick={() => setMenuOpen(false)}
                                    className="block">
                                    {items.name}

                                </NavLink>
                            )}

                            {items.submenu && (
                                <div className={`overflow-hidden transition-all duration-500 ${activeMenu === index ? "max-h-60 mt-4" : "max-h-0"}`}>
                                    <div className="flex flex-col gap-3">
                                        {items.submenu.map((sub, i) => (
                                            <NavLink key={i}
                                                to={sub.path}
                                                onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white">
                                                {sub.name}
                                            </NavLink>
                                        ))}

                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <hr className='mt-8 text-gray-50/20' />
                {/* Social Icons */}
                <ul className='max-auto flex items-center justify-center py-5 gap-3'>
                    <li>
                        <a href="https://instagram.com/naishacreations_withlove" target="_blank" rel="noreferrer" className='p-3 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 transition-transform duration-300 hover:scale-110 flex items-center justify-center'>
                            <FaInstagram className="text-text-on-brand text-xl" />
                        </a>
                    </li>
                    <li>
                        <a href="https://wa.me/+919457583956" target="_blank" rel="noreferrer" className='p-3 rounded-full bg-gradient-to-tr from-green-400 to-green-600 transition-transform duration-300 hover:scale-110 flex items-center justify-center'>
                            <FaWhatsapp className="text-text-on-brand text-xl" />
                        </a>
                    </li>
                    <li>
                        <a href="mailto:support@naishcreations.com" className='p-3 rounded-full bg-gradient-to-tr from-red-400 to-red-600 transition-transform duration-300 hover:scale-110 flex items-center justify-center'>
                            <FaEnvelope className="text-text-on-brand text-xl" />
                        </a>
                    </li>
                </ul>
                <div className="absolute bottom-5 left-0 w-full text-center space-y-4">
                    <p className='text-sm text-text-disabled flex items-center justify-center gap-1'>
                        <Copyright size={16} />
                        <span>{year} Naisha Creations, All Rights Reserved.</span>
                    </p>
                </div>
            </div>
        </>
    )
}

export default MobileMenu
