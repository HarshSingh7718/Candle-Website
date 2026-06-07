import { useState } from 'react';
import ReviewModal from './ReviewModal';

const Reviews = ({ reviews = [] }) => {
  const [selectedReview, setSelectedReview] = useState(null);
  if (reviews.length === 0) return null; // Don't show if no reviews exist

  return (
    <>
    <div className="bg-bg-surface rounded-xl p-6 border border-bg-muted shadow-sm shadow-stone-200/50 mb-stack-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-text-base">Recent Reviews</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div 
            key={index} 
            onClick={() => setSelectedReview(review)}
            className="review-card p-6 rounded-lg bg-bg-surface border border-bg-muted hover:bg-bg-surface-hover transition-colors cursor-pointer group"
          >
            <div className="flex text-yellow-500 mb-3 group-hover:scale-105 origin-left transition-transform">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? 'fill' : ''}`}>star</span>
              ))}
            </div>
            <p className="font-body-md text-body-md text-text-base italic mb-4">"{review.comment}"</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-bg-canvas flex items-center justify-center text-text-base font-label-sm text-label-sm group-hover:bg-brand-primary group-hover:text-text-on-brand transition-colors">
                {review.userName ? review.userName.charAt(0).toUpperCase() : (review.user ? review.user.charAt(0).toUpperCase() : "?")}
              </div>
              <span className="font-label-md text-label-md text-text-muted group-hover:text-brand-primary transition-colors">{review.userName || review.user || "Anonymous"}</span>
            </div>
          </div>
        ))}
      </div>
      </div>

      <ReviewModal 
        review={selectedReview} 
        onClose={() => setSelectedReview(null)} 
        // We do not pass onToggleStatus here because we don't have the API mutate hook in the dashboard component. 
        // If they need to toggle from dashboard, they can go to the Reviews page.
      />
    </>
  );
};

export default Reviews;