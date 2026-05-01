import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const initialReviews = [
  {
    id: 1,
    name: 'Eleanor Vance',
    initial: 'E',
    rating: 5,
    date: 'Oct 12, 2023',
    product: 'Midnight Fig & Cedar',
    status: 'Published',
    text: 'Absolutely stunning throw. The packaging was beautiful and felt so luxurious. The scent fills my entire living room without being overpowering. It truly smells like an old library in the best way possible. Will definitely be ordering again for holiday gifts.',
    reply: null
  },
  {
    id: 2,
    name: 'Marcus Thorne',
    initial: 'M',
    rating: 4,
    date: 'Oct 10, 2023',
    product: 'Wild Sage & Sea Salt',
    status: 'Hidden',
    text: "The candle itself is lovely, but the glass arrived with a slight scratch. The scent is exactly as described, very fresh and clean. Customer service was helpful when I reached out, but I'm slightly disappointed with the initial presentation given the price point.",
    reply: "Dear Marcus, we apologize for the imperfection on the vessel. A replacement has been shipped to you complimentary."
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    initial: 'S',
    rating: 5,
    date: 'Oct 08, 2023',
    product: 'Bergamot & Vetiver',
    status: 'Published',
    text: "I've been burning this every evening. It has such a complex, grounded aroma. You can tell they use high-quality essential oils. The wooden wick crackle is also a wonderful touch. My new favorite shop!",
    reply: null
  }
];

const Reviews = () => {
  const [reviews, setReviews] = useState(initialReviews);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const mainRef = useRef(null);
  const statsRef = useRef([]);
  const reviewsRef = useRef([]);

  useEffect(() => {
    // Fade + slide up entire page content
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // Stagger stats cards
    if (statsRef.current.length > 0) {
      gsap.fromTo(
        statsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
      );
    }
  }, []);

  // Separate effect for reviews to re-animate when filtering changes
  useEffect(() => {
    if (reviewsRef.current.length > 0) {
      gsap.fromTo(
        reviewsRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [searchQuery, activeFilter]);

  const toggleStatus = (id) => {
    setReviews(reviews.map(review => {
      if (review.id === id) {
        return { ...review, status: review.status === 'Published' ? 'Hidden' : 'Published' };
      }
      return review;
    }));
  };

  const filteredReviews = reviews.filter(review => {
    // Search filter
    const matchesSearch = 
      review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.text.toLowerCase().includes(searchQuery.toLowerCase());

    // Chip filter
    let matchesChip = true;
    if (activeFilter === '5 Stars') matchesChip = review.rating === 5;
    if (activeFilter === 'Hidden') matchesChip = review.status === 'Hidden';

    return matchesSearch && matchesChip;
  });

  const addToStatsRef = (el) => {
    if (el && !statsRef.current.includes(el)) {
      statsRef.current.push(el);
    }
  };

  const addToReviewsRef = (el) => {
    if (el && !reviewsRef.current.includes(el)) {
      reviewsRef.current.push(el);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}>
        star
      </span>
    ));
  };

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-stack-md gap-4">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface mb-2">Customer Reviews</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage and curate feedback for your artisan creations.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text"
              placeholder="Search reviews..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 focus:outline-none rounded-t-DEFAULT text-on-surface font-body-md text-body-md transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline text-on-surface hover:bg-surface-container-low transition-colors rounded-DEFAULT font-label-md text-label-md cursor-pointer whitespace-nowrap">
            <span className="material-symbols-outlined">filter_list</span>
            Filter
          </button>
        </div>
      </div>

      {/* Reviews Summary Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-stack-lg">
        <div ref={addToStatsRef} className="bg-surface-container-lowest p-6 rounded-lg border border-surface-variant shadow-[0_4px_20px_-10px_rgba(141,75,0,0.05)]">
          <div className="text-on-surface-variant font-label-sm text-label-sm uppercase mb-2">Average Rating</div>
          <div className="flex items-end gap-2">
            <div className="font-heading text-headline-xl text-on-surface">4.8</div>
            <div className="flex text-primary pb-1">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
            </div>
          </div>
        </div>
        <div ref={addToStatsRef} className="bg-surface-container-lowest p-6 rounded-lg border border-surface-variant shadow-[0_4px_20px_-10px_rgba(141,75,0,0.05)]">
          <div className="text-on-surface-variant font-label-sm text-label-sm uppercase mb-2">Total Reviews</div>
          <div className="font-heading text-headline-xl text-on-surface">1,248</div>
        </div>
        <div ref={addToStatsRef} className="bg-surface-container-lowest p-6 rounded-lg border border-surface-variant shadow-[0_4px_20px_-10px_rgba(141,75,0,0.05)]">
          <div className="text-on-surface-variant font-label-sm text-label-sm uppercase mb-2">Published</div>
          <div className="font-heading text-headline-xl text-on-surface">1,192</div>
        </div>
        <div ref={addToStatsRef} className="bg-surface-container-lowest p-6 rounded-lg border border-surface-variant shadow-[0_4px_20px_-10px_rgba(141,75,0,0.05)]">
          <div className="text-on-surface-variant font-label-sm text-label-sm uppercase mb-2">Pending Review</div>
          <div className="font-heading text-headline-xl text-primary">56</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-surface-container-lowest rounded-lg border border-surface-variant shadow-[0_8px_30px_-15px_rgba(141,75,0,0.08)] overflow-hidden">
        <div className="p-6 border-b border-surface-variant flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface gap-4">
          <h2 className="font-heading text-headline-md text-on-surface">Recent Feedback</h2>
          <div className="flex flex-wrap gap-2">
            {['All', '5 Stars', 'Hidden'].map(filter => (
              <span 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`inline-flex items-center px-3 py-1 rounded-full font-label-sm text-label-sm cursor-pointer transition-colors ${activeFilter === filter ? 'bg-surface-container-high text-on-surface-variant' : 'bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-high'}`}
              >
                {filter}
              </span>
            ))}
          </div>
        </div>

        <div className="divide-y divide-surface-variant">
          {filteredReviews.map((review) => (
            <div 
              key={review.id} 
              ref={addToReviewsRef}
              className={`p-stack-md flex flex-col sm:flex-row gap-6 hover:bg-surface-bright transition-colors ${review.status === 'Hidden' ? 'bg-surface-container-low/30' : ''}`}
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-heading text-headline-md">
                  {review.initial}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-2 gap-4">
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface">{review.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-primary text-sm">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-on-surface-variant text-sm font-body-sm">{review.date}</span>
                    </div>
                    <div className="text-sm text-on-surface-variant mt-1">
                      Purchased: <span className="font-medium text-on-surface">{review.product}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`font-label-sm text-label-sm uppercase tracking-wider ${review.status === 'Published' ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {review.status}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={review.status === 'Published'}
                        onChange={() => toggleStatus(review.id)}
                      />
                      <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-sm"></div>
                    </label>
                  </div>
                </div>
                
                <p className="font-body-md text-body-md text-on-surface mt-3 max-w-3xl">
                  {review.text}
                </p>

                {review.reply && (
                  <div className="mt-4 p-4 bg-surface-container-highest rounded border border-outline-variant/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">reply</span>
                      <span className="font-label-md text-label-md text-on-surface">Atelier Response</span>
                    </div>
                    <p className="font-body-md text-sm text-on-surface-variant">
                      {review.reply}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="py-12 text-center text-on-surface-variant">
              No reviews found matching your criteria.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-surface-variant bg-surface-container flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-on-surface-variant font-body-md">Showing 1-{Math.min(3, filteredReviews.length)} of 1,248 reviews</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50 cursor-pointer">Previous</button>
            <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer">Next</button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Reviews;
