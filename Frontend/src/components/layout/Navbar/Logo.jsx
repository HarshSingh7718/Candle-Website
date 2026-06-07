import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 md:gap-3 whitespace-nowrap group focus:outline-none">
        <img 
            src="https://res.cloudinary.com/dk1qzyep1/image/upload/v1780761036/Naisha-logo-cropped_gy90ho.webp" 
            className="hidden md:block h-6 md:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
        />
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-light-yellow whitespace-nowrap">
            Naisha <span className="text-coffee">Creations</span>
        </h2>
    </Link>
  );
};

export default Logo;
