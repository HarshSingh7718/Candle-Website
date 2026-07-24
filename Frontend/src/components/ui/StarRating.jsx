import React from "react";
import { Star } from "lucide-react";

/**
 * StarRating – Unified rating stars component.
 * @param {number} rating - Rating score (0-5)
 * @param {number} maxStars - Max star count (default 5)
 * @param {number} size - Lucide icon size (default 14)
 * @param {string} className - Optional container styling
 */
const StarRating = ({ rating = 0, maxStars = 5, size = 14, className = "" }) => {
  const roundedRating = Math.round(rating);

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[...Array(maxStars)].map((_, i) => {
        const isFilled = i < roundedRating;
        return (
          <Star
            key={i}
            size={size}
            className={
              isFilled
                ? "fill-star-fill text-star-fill"
                : "fill-none text-bg-muted"
            }
          />
        );
      })}
    </div>
  );
};

export default StarRating;
