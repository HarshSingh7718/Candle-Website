import React from 'react';

// Using inline SVG to resolve lucide-react version compatibility issues
const InstagramIcon = ({ className, strokeWidth = 2, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// Sample image data - candle/lifestyle images for the website
const instagramImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=400&h=400' },
  { id: 2, url: 'https://ekamonline.com/cdn/shop/files/vanilla_candle_copy.jpg?v=1772674641&width=800' },
  { id: 3, url: 'https://ekamonline.com/cdn/shop/files/vanilla_candle_copy.jpg?v=1772674641&width=800' },
  { id: 4, url: 'https://ekamonline.com/cdn/shop/files/vanilla_candle_copy.jpg?v=1772674641&width=800' },
  { id: 5, url: 'https://ekamonline.com/cdn/shop/files/vanilla_candle_copy.jpg?v=1772674641&width=800' },
  { id: 6, url: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&q=80&w=400&h=400' },
];

const InstagramItem = ({ imageUrl }) => {
  return (
    <div className="relative group overflow-hidden rounded-md cursor-pointer aspect-square">
      <img
        src={imageUrl}
        alt="Instagram post"
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500"
      />
      {/* Dark overlay with centered logo */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <InstagramIcon
          className="text-white w-12 h-12 md:w-14 md:h-14 transform scale-90 group-hover:scale-100 transition-transform duration-300"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
};

const Instagram = () => {
  return (
    <section className="px-[11px] pt-16 pb-[15px] bg-gray-50 relative z-10 w-full">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <h2 className="text-3xl md:text-4xl font-serif text-[#222]">Follow Our Journey</h2>
          <InstagramIcon className="w-8 h-8 md:w-10 md:h-10 text-[#222]" strokeWidth={1.5} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {instagramImages.map((img) => (
            <InstagramItem key={img.id} imageUrl={img.url} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instagram;
