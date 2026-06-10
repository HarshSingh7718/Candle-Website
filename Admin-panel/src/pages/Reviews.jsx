import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGetReviews, useUpdateReviewStatus } from '../hooks/useReviews';
import ReviewModal from '../components/ReviewModal';

const Reviews = () => {
  const [selectedReview, setSelectedReview] = useState(null);
  // Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 10;

  // 👉 Send lowercase "pending" to the API to match backend validation
  const apiRating = activeFilter === '5 Stars' ? 5 : undefined;
  const apiStatus = activeFilter === 'Pending' ? 'pending' : undefined;

  // Fetch Data
  const { data, isLoading, isFetching } = useGetReviews(page, limit, apiRating, apiStatus);
  const { mutate: updateStatus } = useUpdateReviewStatus();

  // Extract from backend response
  const reviews = data?.reviews || [];
  const totalReviews = data?.totalReviews || 0;
  // Removed averageRating

  // 👉 Stat Card counts (Checking against lowercase DB values)
  const publishedCount = reviews.filter(r => r.status === 'published').length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  const mainRef = useRef(null);
  const statsRef = useRef([]);
  const reviewsRef = useRef([]);

  // Base page entrance animation
  useEffect(() => {
    gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
  }, []);

  useEffect(() => {
    if (statsRef.current.length > 0 && !isLoading) {
      gsap.fromTo(statsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 });
    }
  }, [isLoading]);

  // List stagger animation
  useEffect(() => {
    if (reviewsRef.current.length > 0 && !isLoading) {
      gsap.fromTo(
        reviewsRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [reviews, searchQuery, isLoading]);

  // 👉 Toggle Logic (Swaps between lowercase 'published' and 'pending')
  const toggleStatus = (productId, reviewId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'pending' : 'published';
    updateStatus({ productId, reviewId, status: newStatus });
  };

  // Frontend search filter
  const filteredReviews = reviews.filter(review => {
    if (!searchQuery) return reviews;
    const query = searchQuery.toLowerCase();
    return (
      review.userName?.toLowerCase().includes(query) || // changed from review.user to review.userName based on your aggregation
      review.productName?.toLowerCase().includes(query) ||
      review.comment?.toLowerCase().includes(query)
    );
  });

  const addToStatsRef = (el) => {
    if (el && !statsRef.current.includes(el)) statsRef.current.push(el);
  };

  const addToReviewsRef = (el) => {
    if (el && !reviewsRef.current.includes(el)) reviewsRef.current.push(el);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}>
        {i < Math.floor(rating) ? 'star' : (i < rating ? 'star_half' : 'star')}
      </span>
    ));
  };



  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full pb-20 opacity-0">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-stack-md gap-4">
        <div>
          <h1 className="font-heading text-headline-lg text-text-base mb-2">Customer Reviews</h1>
          <p className="font-body-md text-body-md text-text-muted">Manage and curate feedback for your artisan creations.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">search</span>
            <input
              type="text"
              placeholder="Search loaded reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-bg-canvas border-b border-bg-muted focus:border-brand-primary focus:ring-0 focus:outline-none rounded-t-DEFAULT text-text-base font-body-md text-body-md transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Reviews Summary Bento - Changed to lg:grid-cols-3 to balance the 3 remaining cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-stack-lg">
        <div ref={addToStatsRef} className="bg-bg-surface p-6 rounded-lg border border-bg-muted shadow-[0_4px_20px_-10px_rgba(141,75,0,0.05)]">
          <div className="text-text-muted font-label-sm text-label-sm uppercase mb-2">Total Reviews</div>
          <div className="font-heading text-headline-xl text-text-base">{totalReviews}</div>
        </div>

        {/* 👉 Reviews Published */}
        <div ref={addToStatsRef} className="bg-bg-surface p-6 rounded-lg border border-bg-muted shadow-[0_4px_20px_-10px_rgba(141,75,0,0.05)]">
          <div className="text-text-muted font-label-sm text-label-sm uppercase mb-2">Reviews Published</div>
          <div className="font-heading text-headline-xl text-text-base">{publishedCount}</div>
        </div>

        {/* 👉 Reviews Pending */}
        <div ref={addToStatsRef} className="bg-bg-surface p-6 rounded-lg border border-bg-muted shadow-[0_4px_20px_-10px_rgba(141,75,0,0.05)]">
          <div className="text-text-muted font-label-sm text-label-sm uppercase mb-2">Reviews Pending</div>
          <div className="font-heading text-headline-xl text-brand-primary">{pendingCount}</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className={`bg-bg-surface rounded-lg border border-bg-muted shadow-[0_8px_30px_-15px_rgba(141,75,0,0.08)] overflow-hidden transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="p-6 border-b border-bg-muted flex flex-col sm:flex-row justify-between items-start sm:items-center bg-bg-surface gap-4">
          <h2 className="font-heading text-headline-md text-text-base">Recent Feedback</h2>
          <div className="flex flex-wrap gap-2">
            {['All', '5 Stars', 'Pending'].map(filter => (
              <span
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setPage(1);
                }}
                className={`inline-flex items-center px-3 py-1 rounded-full font-label-sm text-label-sm cursor-pointer transition-colors ${activeFilter === filter ? 'bg-bg-muted text-text-muted' : 'bg-bg-muted text-text-muted border border-bg-muted hover:bg-bg-muted'}`}
              >
                {filter}
              </span>
            ))}
          </div>
        </div>

        <div className="divide-y divide-surface-variant">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="p-stack-md flex flex-col sm:flex-row gap-6 animate-pulse border-b border-bg-muted">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-bg-muted"></div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row justify-between items-start mb-2 gap-4">
                    <div>
                      <div className="h-4 bg-bg-muted rounded w-32 mb-2"></div>
                      <div className="h-3 bg-bg-muted rounded w-48 mb-2"></div>
                      <div className="h-3 bg-bg-muted rounded w-40"></div>
                    </div>
                    <div className="h-6 w-16 bg-bg-muted rounded-full"></div>
                  </div>
                  <div className="h-4 bg-bg-muted rounded w-full mt-4"></div>
                  <div className="h-4 bg-bg-muted rounded w-3/4 mt-2"></div>
                </div>
              </div>
            ))
          ) : filteredReviews.map((review) => {
            const initial = review.userName ? review.userName.charAt(0).toUpperCase() : 'U';
            const formattedDate = new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

            // Format status for UI display
            const isPublished = review.status === 'published';
            const displayStatus = isPublished ? 'Published' : 'Pending';

            return (
              <div
                key={review._id} // Assuming the backend returns _id for the review (if not, use review.userId + review.productId)
                ref={addToReviewsRef}
                onClick={() => setSelectedReview(review)}
                className={`p-stack-md flex flex-col sm:flex-row gap-6 hover:bg-bg-surface-bright transition-colors cursor-pointer group ${!isPublished ? 'bg-bg-canvas/30' : ''}`}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-bg-muted flex items-center justify-center text-text-muted font-heading text-headline-md">
                    {initial}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row justify-between items-start mb-2 gap-4">
                    <div>
                      <h3 className="font-label-md text-label-md text-text-base">{review.userName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-brand-primary text-sm">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-text-muted text-sm font-body-sm">{formattedDate}</span>
                      </div>
                      <div className="text-sm text-text-muted mt-1">
                        Purchased: <span className="font-medium text-text-base">{review.productName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status Text */}
                      <span className={`font-label-sm text-label-sm uppercase tracking-wider ${isPublished ? 'text-brand-primary' : 'text-text-muted'}`}>
                        {displayStatus}
                      </span>
                      {/* Status Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isPublished}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleStatus(review.productId, review._id, review.status || 'pending')}
                        />
                        <div className="w-11 h-6 bg-bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-bg-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary shadow-sm"></div>
                      </label>
                    </div>
                  </div>

                  <p className="font-body-md text-body-md text-text-base mt-3 max-w-3xl">
                    {review.comment}
                  </p>
                </div>
              </div>
            );
          })}

          {(!isLoading && filteredReviews.length === 0) && (
            <div className="py-12 text-center text-text-muted">
              No reviews found matching your criteria.
            </div>
          )}
        </div>

        {/* Dynamic Pagination */}
        <div className="p-4 border-t border-bg-muted bg-bg-muted flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-text-muted font-body-md">
            Showing {totalReviews === 0 ? 0 : (page - 1) * limit + 1}-{Math.min(page * limit, totalReviews)} of {totalReviews} reviews
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-bg-muted rounded bg-bg-surface text-text-muted hover:bg-bg-canvas transition-colors disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={page * limit >= totalReviews}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-bg-muted rounded bg-bg-surface text-text-base hover:bg-bg-canvas transition-colors disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ReviewModal 
        review={selectedReview} 
        onClose={() => setSelectedReview(null)} 
        onToggleStatus={toggleStatus} 
      />
    </main>
  );
};

export default Reviews;