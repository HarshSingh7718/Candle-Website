import React, { memo } from "react";

const ProductCardSkeleton = memo(() => {
  return (
    <div className="product-item relative product-card group animate-pulse">
      {/* Image Skeleton */}
      <div className="product-image relative rounded-md aspect-[4/5] overflow-hidden bg-bg-muted/50">
      </div>

      {/* Content Skeleton */}
      <div className="product-content py-3 space-y-3">
        {/* Category Skeleton */}
        <div className="h-3 bg-bg-muted/50 rounded w-1/3"></div>

        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-bg-muted/50 rounded w-full"></div>
          <div className="h-4 bg-bg-muted/50 rounded w-4/5"></div>
        </div>

        {/* Stars Skeleton */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-bg-muted/50 rounded-full"></div>
          ))}
        </div>

        {/* Price Skeleton */}
        <div className="h-4 bg-bg-muted/50 rounded w-1/4 mt-2"></div>
      </div>
    </div>
  );
});

export default ProductCardSkeleton;
