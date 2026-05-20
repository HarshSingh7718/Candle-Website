import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// 👉 Changed to react-icons/fa6 (FontAwesome 6)
import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa6';
import FooterLink from './FooterLink';
import API from '../../../api';

const Footer = () => {
  const location = useLocation();
  const isAuthPage = ['/signin', '/register', '/forgot-password', '/verify-otp'].includes(location.pathname);

  // Fetch Categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['footerCategories'],
    queryFn: async () => {
      const { data } = await API.get('/categories');
      return data.categories;
    }
  });

  // Slice to get only the first 5 categories
  const topCategories = categories.slice(0, 5);

  if (isAuthPage) return null;

  return (
    <footer className="bg-black pt-16 pb-8 md:pb-12 px-6 md:px-12 lg:px-24 relative z-10 w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-7 md:gap-12">

        {/* Brand & Social Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white">
            Naisha <span className="text-[#D19D94]">Creations</span>
          </h2>
          <p className="text-gray-400 leading-relaxed max-w-xs text-md md:text-md">
            Discover the latest trends and enjoy seamless shopping with our exclusive artisan collections.
          </p>

          {/* 👉 Updated Social Icons using react-icons */}
          <ul className='flex items-center py-2 gap-3'>
            <li>
              <a href="https://instagram.com/naishacreations_withlove" target="_blank" rel="noreferrer" className='p-3 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 transition-transform duration-300 hover:scale-110 flex items-center justify-center'>
                <FaInstagram className="text-white text-xl" />
              </a>
            </li>
            <li>
              <a href="https://wa.me/+917350479904" target="_blank" rel="noreferrer" className='p-3 rounded-full bg-gradient-to-tr from-green-400 to-green-600 transition-transform duration-300 hover:scale-110 flex items-center justify-center'>
                <FaWhatsapp className="text-white text-xl" />
              </a>
            </li>
            <li>
              <a href="mailto:" className='p-3 rounded-full bg-gradient-to-tr from-red-400 to-red-600 transition-transform duration-300 hover:scale-110 flex items-center justify-center'>
                <FaEnvelope className="text-white text-xl" />
              </a>
            </li>
          </ul>
        </div>

        {/* Useful Links */}
        <div className='hidden md:block'>
          <h3 className="text-xl font-bold text-white mb-4 md:mb-6">Useful Links</h3>
          <ul className="space-y-3">
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/about">Our Story</FooterLink>
            <FooterLink href="/collections">Shop Collections</FooterLink>
            <FooterLink href="/custom-candle">Customise</FooterLink>
            <FooterLink href="/contact">Contact Support</FooterLink>
          </ul>
        </div>

        {/* Dynamic Categories */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 md:mb-6">Categories</h3>
          <ul className="space-y-3">
            {isLoading ? (
              <li className="text-gray-400 text-sm">Loading categories...</li>
            ) : topCategories.length > 0 ? (
              topCategories.map((category) => (
                <FooterLink key={category._id} href={`/collections?category=${category.slug || category._id}`}>
                  {category.name}
                </FooterLink>
              ))
            ) : (
              <li className="text-gray-400 text-sm">No categories found</li>
            )}
          </ul>
        </div>

      </div>

      {/* Bottom Footer Section */}
      <div className="mt-8 md:mt-16 pt-7 md:pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Naisha Creations. All rights reserved.</p>
        <div className="flex gap-4 md:gap-6">
          <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/term-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;