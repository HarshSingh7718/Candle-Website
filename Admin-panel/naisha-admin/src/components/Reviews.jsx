const Reviews = () => {
  const reviews = [
    {
      text: "Absolutely in love with the Sandalwood & Amber. The scent fills the room perfectly without being overwhelming. High quality packaging too.",
      author: "Emma T.",
      initials: "ET",
      rating: 5
    },
    {
      text: "The Lavender Fields candle is very relaxing. Burn time is exactly as advertised. Deducted one star because shipping took an extra day.",
      author: "James W.",
      initials: "JW",
      rating: 4
    },
    {
      text: "Bergamot Night is my new go-to gift. The aesthetic of the jar is so chic and minimalist. Will definitely be ordering more for the holidays.",
      author: "Sarah J.",
      initials: "SJ",
      rating: 5
    }
  ];

  return (
    <div className="bg-surface rounded-xl p-6 border border-surface-container shadow-sm shadow-stone-200/50 mb-stack-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-on-background">Recent Reviews</h3>
        <button className="text-primary font-label-md text-label-md hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div key={index} className="review-card p-6 rounded-lg bg-surface-container-lowest border border-surface-container">
            <div className="flex text-primary mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? 'fill' : ''}`}>star</span>
              ))}
            </div>
            <p className="font-body-md text-body-md text-on-surface italic mb-4">"{review.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-label-sm text-label-sm">{review.initials}</div>
              <span className="font-label-md text-label-md text-on-surface-variant">{review.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
