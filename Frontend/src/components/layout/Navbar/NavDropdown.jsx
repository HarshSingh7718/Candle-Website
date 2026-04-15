import React, { useEffect, useState,useRef,} from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDown } from 'lucide-react';

const NavDropdown = ({item}) => {
    const [open,setOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown =()=>{
    setOpen(!open);
  };

  return (
    <>
      <div ref={dropdownRef} className="relative" 
      onMouseEnter={()=>setOpen(true)}
      onMouseLeave={()=>setOpen(false)}
      >
       
       <div className="flex items-center gap-1 cursor-pointer" onClick={toggleDropdown}>
        <NavLink
        to={item.path}
        className="text-sm md:text-[16px] font-medium text-white nav-link"
        onClick={(e)=>{
            if(item.submenu) e.preventDefault();
        }}>
            {item.name}
        </NavLink>

        <ChevronDown
        size={20}
        className={`transition transform text-white duration-300 ${open ? "rotate-180":""}`}
        />
       </div>
         
         {/* submenu */}
         <ul className={`nav-dropdown-menu absolute top-full left-0 mt-2 lg:w-40 xl:w-44 bg-primary text-white rounded-sm shadow-lg overflow-hidden transition-all duration-300 space-y-4 py-5 ${open ? "max-h-125 opacity-100 visible ":"max-h-0 opacity-0 invisible"}`}>
           
           {item.submenu.map((sub,index)=>(
            <li key={index} className="group">
                <NavLink to={sub.path}
                className="block px-4 transition-transform transform duration-300 group-hover:translate-x-1 nav-link  text-sm">
                    {sub.name}
                </NavLink>
            </li>
           ))}
         </ul>
      </div>
    </>
  )
}

export default NavDropdown
