import React, { useState } from 'react';
import FooterLink from './FooterLink';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Placeholder function for newsletter integration
    console.log(`Subscribed with email: ${email}`);
    setEmail('');
  };

  return (
    <footer className="bg-black pt-16 pb-12 px-6 md:px-12 lg:px-24 relative z-10 w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Brand Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Naisha <span className="text-[#ff5a5f]">Creations</span>
          </h2>
          <p className="text-gray-400 leading-relaxed max-w-xs">
            Discover the latest trends and enjoy seamless shopping with our exclusive collections.
          </p>
        </div>

        {/* Useful Links */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6">Useful Links</h3>
          <ul className="space-y-3">
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/#about">About Us</FooterLink>
            <FooterLink href="/#collections">Shop</FooterLink>
            <FooterLink href="/#customized">Customized</FooterLink>
            <FooterLink href="/#contact">Contact</FooterLink>
          </ul>
        </div>

        {/* Categories */}
        <div className='hidden md:block'>
          <h3 className="text-xl font-bold text-white mb-6">Categories</h3>
          <ul className="space-y-3">
            <FooterLink href="#">Scented Candles</FooterLink>
            <FooterLink href="#">Classic Furnishings</FooterLink>
            <FooterLink href="#">Crystal Clarity Optics</FooterLink>
            <FooterLink href="#">Aromatherapy</FooterLink>
            <FooterLink href="#">Gift Sets</FooterLink>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6">Newsletter</h3>
          <p className="text-gray-400 mb-6">
            Enter your email below to be the first to know about new collections and product launches.
          </p>
          <form onSubmit={handleSubscribe} className="flex h-12 w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-grow px-4 bg-transparent border border-gray-700 text-white focus:outline-none focus:border-[#ff5a5f] transition-colors"
              required
            />
            <button 
              type="submit" 
              className="bg-white text-black px-6 font-semibold hover:bg-gray-200 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

      </div>

      <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Naisha Creations. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
