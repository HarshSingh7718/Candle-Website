import React from "react";
import { Link } from "react-router-dom";

function CollectionsCard({ image, title, description, slug}) {
  return (
    <Link
      to={`/collections/${slug}`}
      state={{ collectionName: title }}
      className="collections-card flex justify-center items-end pb-8 relative h-72 md:h-96 lg:h-110 group overflow-hidden rounded-md cursor-pointer block"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-500"></div>

      {/* Content - Changed z-1 to z-10 for safety */}
      <div className="text-light-yellow relative z-10 px-5 text-center transform translate-y-12 group-hover:translate-y-0 transition-all duration-500">
        <h5 className="mb-3 text-2xl font-semibold">{title}</h5>
        <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200 leading-wider">
          {description.slice(0, 100) + '...'}
        </p>
      </div>
    </Link>
  );
}

export default CollectionsCard;
