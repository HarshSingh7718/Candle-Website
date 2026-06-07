import React from 'react';
import { createPortal } from "react-dom";

const renderStars = (rating) => {
  return Array.from({ length: 5 }).map((_, i) => (
    <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}>
      {i < Math.floor(rating) ? 'star' : (i < rating ? 'star_half' : 'star')}
    </span>
  ));
};

const ReviewModal = ({ review, onClose, onToggleStatus }) => {
  if (!review) return null;

  const initial = review.userName ? review.userName.charAt(0).toUpperCase() : 'U';
  const isPublished = review.status === 'published';
  const displayStatus = isPublished ? 'Published' : 'Pending';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface p-8 rounded-2xl max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-danger transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-bg-muted">
          <div className="w-14 h-14 rounded-full bg-bg-surface-hover flex items-center justify-center text-xl font-heading text-brand-primary">
            {initial}
          </div>
          <div>
            <h3 className="font-heading text-headline-sm text-text-base">{review.userName || 'Anonymous'}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-bold capitalize ${isPublished ? 'bg-success/10 text-success' : 'bg-bg-muted text-text-muted'}`}>
              {displayStatus}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <p className="text-xs font-bold tracking-widest text-text-muted uppercase mb-1">Product</p>
            <p className="font-body-md text-text-base">{review.productName}</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-text-muted uppercase mb-1">Rating</p>
            <div className="flex text-brand-primary">
              {renderStars(review.rating)}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-text-muted uppercase mb-1">Date</p>
            <p className="font-body-md text-text-base">{new Date(review.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-text-muted uppercase mb-2">Review Comment</p>
            <div className="p-4 bg-bg-surface-hover rounded-lg border border-bg-muted/50 max-h-48 overflow-y-auto custom-scrollbar">
              <p className="font-body-md text-text-base whitespace-pre-wrap">{review.comment}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-bg-muted">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-bg-muted text-text-base hover:bg-bg-surface-hover transition-colors cursor-pointer font-label-md"
          >
            Close
          </button>
          <button
            onClick={() => {
              if(onToggleStatus) {
                onToggleStatus(review.productId, review._id, review.status || 'pending');
              }
              onClose();
            }}
            className={`px-5 py-2.5 rounded-lg text-white transition-colors cursor-pointer font-label-md shadow-sm ${isPublished ? 'bg-orange-600 hover:bg-orange-700' : 'bg-brand-primary hover:bg-brand-primary-container'}`}
          >
            {isPublished ? 'Move to Pending' : 'Publish Review'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReviewModal;
