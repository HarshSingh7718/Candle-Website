const Reviews = ({ reviews = [] }) => {
  if (reviews.length === 0) return null; // Don't show if no reviews exist

  return (
    <div className="bg-surface rounded-xl p-6 border border-surface-container shadow-sm shadow-stone-200/50 mb-stack-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-on-background">Recent Reviews</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div key={index} className="review-card p-6 rounded-lg bg-surface-container-lowest border border-surface-container">
            <div className="flex text-yellow-500 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? 'fill' : ''}`}>star</span>
              ))}
            </div>
            <p className="font-body-md text-body-md text-on-surface italic mb-4">"{review.comment}"</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-label-sm text-label-sm">
                {review.user ? review.user.charAt(0).toUpperCase() : "?"}
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">{review.user || "Anonymous"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;