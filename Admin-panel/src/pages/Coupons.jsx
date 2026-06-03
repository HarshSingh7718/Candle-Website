import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGetCoupons, useDeleteCoupon, useToggleCoupon } from '../hooks/useCoupons';

const Coupons = () => {
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const rowsRef = useRef([]);

  const { data: coupons = [], isLoading } = useGetCoupons();
  const { mutate: deleteCoupon } = useDeleteCoupon();
  const { mutate: toggleStatus } = useToggleCoupon();

  useEffect(() => {
    if (isLoading) return;
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
    if (rowsRef.current.length > 0) {
      gsap.fromTo(
        rowsRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.15 }
      );
    }
  }, [coupons.length, isLoading]);

  const addToRowsRef = (el) => {
    if (el && !rowsRef.current.includes(el)) {
      rowsRef.current.push(el);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isExpired = (endDate) => new Date(endDate) < new Date();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-margin-page max-w-container-max mx-auto w-full opacity-0" ref={mainRef}>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-stack-lg">
        <div>
          <h2 className="font-heading text-headline-lg text-on-surface mb-2">Coupon Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Create, manage, and track promotional discount codes. Monitor usage and toggle availability in real-time.
          </p>
        </div>
        <button
          onClick={() => navigate('/coupons/add')}
          className="shrink-0 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3 px-6 rounded-lg shadow-sm shadow-orange-900/20 transition-all flex items-center justify-center gap-2 border-b-2 border-primary-container hover:border-surface-tint cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-surface-variant bg-surface-container-low">
                <th className="text-left px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Code</th>
                <th className="text-left px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Discount</th>
                <th className="text-left px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Validity</th>
                <th className="text-left px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Usage</th>
                <th className="text-left px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const expired = isExpired(coupon.endDate);
                const usagePercent = coupon.usageLimit
                  ? Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100))
                  : null;

                return (
                  <tr
                    key={coupon._id}
                    ref={addToRowsRef}
                    className="border-b border-surface-variant/50 last:border-0 hover:bg-surface-container-low/50 transition-colors"
                  >
                    {/* Code */}
                    <td className="px-6 py-4">
                      <span className="font-heading text-headline-md text-on-surface tracking-wider bg-surface-container px-3 py-1 rounded-md border border-surface-variant inline-block">
                        {coupon.code}
                      </span>
                    </td>

                    {/* Discount */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-label-md text-on-surface">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} OFF`}
                        </span>
                        {coupon.discountType === 'percentage' && coupon.maxDiscountAmount && (
                          <span className="text-xs text-on-surface-variant">
                            Max ₹{coupon.maxDiscountAmount}
                          </span>
                        )}
                        {coupon.minOrderValue > 0 && (
                          <span className="text-xs text-on-surface-variant">
                            Min order ₹{coupon.minOrderValue}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Validity */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-on-surface">
                          {formatDate(coupon.startDate)} – {formatDate(coupon.endDate)}
                        </span>
                        {expired && (
                          <span className="text-xs text-error font-label-sm">Expired</span>
                        )}
                      </div>
                    </td>

                    {/* Usage */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <span className="text-sm font-label-md text-on-surface">
                          {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / ∞'}
                        </span>
                        {usagePercent !== null && (
                          <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${usagePercent >= 90 ? 'bg-error' : usagePercent >= 60 ? 'bg-orange-500' : 'bg-primary'}`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-4">
                      <label className="flex items-center cursor-pointer gap-3">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={coupon.isActive}
                            onChange={() => toggleStatus(coupon._id)}
                          />
                          <div className={`block w-10 h-6 rounded-full transition-colors ${coupon.isActive ? 'bg-primary' : 'bg-surface-variant border border-outline-variant'}`}></div>
                          <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${coupon.isActive ? 'bg-surface-container-lowest translate-x-4' : 'bg-on-surface-variant'}`}></div>
                        </div>
                        <span className="font-label-md text-label-md text-on-surface-variant">
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/coupons/edit/${coupon._id}`)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon._id)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {coupons.length === 0 && !isLoading && (
        <div className="text-center py-12 text-on-surface-variant font-body-lg">
          No coupons available. Create one to get started.
        </div>
      )}
    </main>
  );
};

export default Coupons;
