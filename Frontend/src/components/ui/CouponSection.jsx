import React, { useState } from 'react';
import { Tag, Check, X, Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCoupon } from '../../hooks/useCoupon';

const CouponSection = ({ variant = "full", className = "" }) => {
  const navigate = useNavigate();
  const {
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    discountAmount,
    isApplying,
    availableCoupons,
    isLoadingCoupons,
    bestCoupon,
  } = useCoupon();

  const [inputCode, setInputCode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleManualApply = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    applyCoupon(inputCode.trim().toUpperCase());
    setInputCode("");
  };

  // ── VARIANT 1: "recap" (Checkout.jsx when coupon applied) ──
  if (variant === "recap" && appliedCoupon) {
    return (
      <div className={`bg-emerald-50/80 border border-emerald-200 rounded-lg p-3.5 flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Check size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-wider uppercase text-emerald-900">
                {appliedCoupon.code}
              </span>
              <span className="text-[11px] font-semibold bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded">
                -₹{discountAmount}
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              {appliedCoupon.title || "Coupon applied successfully"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
        >
          Change
        </button>
      </div>
    );
  }

  // ── VARIANT 2: "minimal" (Checkout.jsx fallback when no coupon applied) ──
  if (variant === "minimal") {
    if (appliedCoupon) {
      return (
        <div className={`bg-emerald-50/80 border border-emerald-200 rounded-lg p-3.5 flex items-center justify-between ${className}`}>
          <div className="flex items-center gap-2.5">
            <Check size={16} className="text-emerald-600" />
            <div>
              <span className="font-bold text-xs uppercase text-emerald-900">{appliedCoupon.code}</span>
              <span className="ml-2 text-xs font-semibold text-emerald-700">-₹{discountAmount}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
          >
            Remove
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleManualApply} className={`flex gap-2 ${className}`}>
        <div className="relative flex-1">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="PROMO CODE"
            className="w-full h-10 px-3 py-2 text-xs uppercase tracking-wider bg-bg-surface border border-bg-muted rounded outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isApplying || !inputCode.trim()}
          className="h-10 px-4 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isApplying ? "..." : "Apply"}
        </button>
      </form>
    );
  }

  // ── VARIANT 3: "full" (Cart.jsx main experience) ──
  const inlineCoupons = availableCoupons.slice(0, 2);

  return (
    <div className={`space-y-3.5 ${className}`}>

      {/* Applied Badge */}
      {appliedCoupon ? (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-lg p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Tag size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-wider uppercase text-emerald-900">
                  {appliedCoupon.code}
                </span>
                <span className="text-[11px] font-semibold bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded">
                  Saved ₹{discountAmount}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {appliedCoupon.title || "Coupon offer applied"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <>
          {/* Best Coupon Banner */}
          {bestCoupon && (
            <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-lg p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Sparkles size={15} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-950">
                      Save ₹{bestCoupon.discountAmount}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded tracking-wider">
                      BEST OFFER
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Use code <strong className="uppercase">{bestCoupon.code}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isApplying}
                onClick={() => applyCoupon(bestCoupon.code)}
                className="text-xs font-bold bg-emerald-700 text-white px-3 py-1.5 rounded hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}

          {/* Manual Code Input */}
          <form onSubmit={handleManualApply} className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="ENTER PROMO CODE"
              className="flex-1 h-10 px-3 py-2 text-xs uppercase tracking-wider bg-bg-surface border border-bg-muted rounded outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={isApplying || !inputCode.trim()}
              className="h-10 px-4 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isApplying ? "..." : "Apply"}
            </button>
          </form>

          {/* Available Offers List (Inline Top 2) */}
          {availableCoupons.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs text-text-muted">
                <span className="font-semibold tracking-wider uppercase text-[11px]">
                  Available Offers
                </span>
                {availableCoupons.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-coffee font-semibold hover:underline cursor-pointer flex items-center gap-0.5 text-[11px]"
                  >
                    View all {availableCoupons.length} offers <ChevronRight size={12} />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {inlineCoupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className="border border-bg-muted/60 rounded p-2.5 flex items-center justify-between bg-bg-surface hover:border-coffee/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs tracking-wider uppercase text-heading">
                          {coupon.code}
                        </span>
                        {coupon.discountAmount > 0 && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Save ₹{coupon.discountAmount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {coupon.title || coupon.description}
                      </p>
                      {!coupon.isEligible && coupon.reason && (
                        <p className="text-[10px] text-amber-700 mt-0.5 italic">
                          {coupon.reason}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={isApplying || !coupon.isEligible}
                      onClick={() => applyCoupon(coupon.code)}
                      className="text-xs font-bold text-primary hover:text-coffee transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer px-2 py-1"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── "View All Offers" Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-heading/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-bg-surface rounded-lg max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl border border-bg-muted"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-bg-muted flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-primary" />
                <h3 className="font-semibold text-base text-heading">
                  All Available Offers ({availableCoupons.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-heading cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className={`border rounded-lg p-3 flex items-start justify-between transition-colors ${
                    coupon.isBest
                      ? "border-emerald-300 bg-emerald-50/60"
                      : "border-bg-muted bg-bg-surface"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs tracking-wider uppercase text-heading bg-bg-canvas px-2 py-0.5 rounded border border-bg-muted/40">
                        {coupon.code}
                      </span>
                      {coupon.isBest && (
                        <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                          BEST OFFER
                        </span>
                      )}
                      {coupon.discountAmount > 0 && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                          Save ₹{coupon.discountAmount}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-heading">
                      {coupon.title}
                    </h4>
                    {coupon.description && (
                      <p className="text-[11px] text-text-muted">
                        {coupon.description}
                      </p>
                    )}
                    {!coupon.isEligible && coupon.reason && (
                      <p className="text-[10px] text-rose-700 italic">
                        {coupon.reason}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isApplying || !coupon.isEligible}
                    onClick={() => {
                      applyCoupon(coupon.code);
                      setIsModalOpen(false);
                    }}
                    className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 ml-3"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CouponSection;
