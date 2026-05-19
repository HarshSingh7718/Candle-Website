import React from "react";

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

// Updated image data with both the photo URL and the original Instagram post URL
const instagramImages = [
  {
    id: 1,
    photoUrl: "/post-Image1.jpg", // Local image for better performance
    postUrl: "https://www.instagram.com/p/DXMjBMUjIoz/?igsh=djAxdjMyeHA1bjh1", // Replace with actual IG post link
  },
  {
    id: 2,
    photoUrl: "/post-Image2.jpg",
    postUrl:
      "https://www.instagram.com/reel/DYHq7D2sckf/?igsh=MWFjbTM4aHJnd2NoNQ==",
  },
  {
    id: 3,
    photoUrl: "/post-Image3.jpg",
    postUrl:
      "https://www.instagram.com/p/DYRTj5mk67t/?img_index=6&igsh=aGx5bG9wMG0xeHpn",
  },
  {
    id: 4,
    photoUrl: "/post-Image4.jpg",
    postUrl:
      "https://www.instagram.com/reel/DXHLHc2E_su/?igsh=MTkxaWpwaGp0OW1mbA==",
  },
  {
    id: 5,
    photoUrl: "/post-Image5.jpg",
    postUrl:
      "https://www.instagram.com/reel/DPc3XfqE0yT/?igsh=cWdtd25xNWhiYXpx",
  },
  {
    id: 6,
    photoUrl: "/post-Image6.jpg",
    postUrl:
      "https://www.instagram.com/reel/DXOJ0vPkyWJ/?igsh=MTdtbjYzMDYxcTkwMw==",
  },
];

// Changed from <div> to <a> to make the whole item a clickable link
const InstagramItem = ({ photoUrl, postUrl }) => {
  return (
    <a
      href={postUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="relative group overflow-hidden rounded-md cursor-pointer aspect-square block"
    >
      <img
        src={photoUrl}
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
    </a>
  );
};

const Instagram = () => {
  return (
    <section className="px-[11px] pt-13 md:pt-16 pb-[15px] bg-gray-50 relative z-10 w-full">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <h2 className="text-3xl md:text-4xl font-serif text-[#222]">
            Follow Our Journey
          </h2>
          <InstagramIcon
            className="w-8 h-8 md:w-10 md:h-10 text-[#222]"
            strokeWidth={1.5}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {instagramImages.map((img) => (
            <InstagramItem
              key={img.id}
              photoUrl={img.photoUrl}
              postUrl={img.postUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instagram;
