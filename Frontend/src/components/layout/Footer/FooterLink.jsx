import React from 'react';

const FooterLink = ({ href, children }) => (
  <li>
    <a 
      href={href} 
      className="relative inline-block text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 group pb-1"
    >
      <span>{children}</span>
      {/* Animated Underline */}
      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white transition-all duration-500 group-hover:w-full"></span>
    </a>
  </li>
);

export default FooterLink;
