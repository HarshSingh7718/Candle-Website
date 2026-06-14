import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGetCoupons, useDeleteCoupon, useToggleCoupon } from '../hooks/useCoupons';
import TableSkeleton from '../components/Skeletons/TableSkeleton';

import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const Coupons = () => {
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const rowsRef = useRef([]);

  const { data: coupons = [], isLoading, isFetching } = useGetCoupons();
  const { mutate: deleteCoupon } = useDeleteCoupon();
  const { mutate: toggleStatus } = useToggleCoupon();

  // Pagination logic
  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPages = Math.ceil(coupons.length / limit);
  const currentCoupons = coupons.slice((page - 1) * limit, page * limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    if (rowsRef.current.length > 0 && !isLoading) {
      gsap.fromTo(
        rowsRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.15 }
      );
    }
  }, [coupons, isLoading]);

  const addToRowsRef = (el) => {
    if (el && !rowsRef.current.includes(el)) {
      rowsRef.current.push(el);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isExpired = (endDate) => new Date(endDate) < new Date();



  return (
    <main className="flex-1 p-6 md:p-margin-page max-w-container-max mx-auto w-full opacity-0" ref={mainRef}>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-stack-lg">
        <div>
          <h2 className="font-heading text-headline-lg text-text-base mb-2">Coupon Management</h2>
          <p className="font-body-md text-body-md text-text-muted max-w-2xl">
            Create, manage, and track promotional discount codes. Per-user usage limits ensure fair distribution.
          </p>
        </div>
        <button
          onClick={() => navigate('/coupons/add')}
          className="shrink-0 bg-brand-primary hover:bg-coffee-800 text-text-on-brand font-label-md text-label-md py-3 px-6 rounded-lg shadow-sm shadow-orange-900/20 transition-all flex items-center justify-center gap-2 border-b-2 border-coffee-800 hover:border-brand-secondary cursor-pointer"
        >
          <Plus className=" text-lg" />
          Add Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className={`bg-bg-surface border border-bg-muted rounded-xl overflow-hidden shadow-sm transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-bg-muted bg-bg-canvas">
                <th className="text-left px-6 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Code</th>
                <th className="text-left px-6 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Discount</th>
                <th className="text-left px-6 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Validity</th>
                <th className="text-left px-6 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Per User</th>
                <th className="text-left px-6 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : currentCoupons.map((coupon) => {
                const expired = isExpired(coupon.endDate);

                return (
                  <tr
                    key={coupon._id}
                    ref={addToRowsRef}
                    className="border-b border-bg-muted/50 last:border-0 hover:bg-bg-canvas/50 transition-colors"
                  >
                    {/* Code */}
                    <td className="px-6 py-4">
                      <span className="font-heading text-headline-md text-text-base tracking-wider bg-bg-muted px-3 py-1 rounded-md border border-bg-muted inline-block">
                        {coupon.code}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-label-md text-text-base">{coupon.title || '—'}</span>
                        {coupon.description && (
                          <span className="text-xs text-text-muted line-clamp-1">{coupon.description}</span>
                        )}
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-label-md text-text-base">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} OFF`}
                        </span>
                        {coupon.discountType === 'percentage' && coupon.maxDiscountAmount && (
                          <span className="text-xs text-text-muted">
                            Max ₹{coupon.maxDiscountAmount}
                          </span>
                        )}
                        {coupon.minOrderValue > 0 && (
                          <span className="text-xs text-text-muted">
                            Min order ₹{coupon.minOrderValue}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Validity */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-text-base">
                          {formatDate(coupon.startDate)} – {formatDate(coupon.endDate)}
                        </span>
                        {expired && (
                          <span className="text-xs text-danger font-label-sm">Expired</span>
                        )}
                      </div>
                    </td>

                    {/* Per User Limit */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-label-md text-text-base">
                        {coupon.usageLimitPerUser}× per user
                      </span>
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
                          <div className={`block w-10 h-6 rounded-full transition-colors ${coupon.isActive ? 'bg-brand-primary' : 'bg-bg-muted border border-bg-muted'}`}></div>
                          <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${coupon.isActive ? 'bg-bg-surface translate-x-4' : 'bg-text-muted'}`}></div>
                        </div>
                        <span className="font-label-md text-label-md text-text-muted">
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/coupons/edit/${coupon._id}`)}
                          className="p-2 text-text-muted hover:text-brand-primary hover:bg-bg-muted rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil  />
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon._id)}
                          className="p-2 text-text-muted hover:text-danger hover:bg-danger/10/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2  />
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
        <div className="text-center py-12 text-text-muted font-body-lg">
          No coupons available. Create one to get started.
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 flex items-center justify-between bg-bg-surface rounded-xl border border-bg-muted/30 mt-6">
          <span className="text-sm text-text-muted">
            Showing page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded border border-bg-muted text-text-muted hover:bg-bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className=" text-[18px]" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 rounded border text-sm font-medium transition-colors ${
                  pageNum === page
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'border-bg-muted text-text-muted hover:bg-bg-surface-hover'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded border border-bg-muted text-text-muted hover:bg-bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className=" text-[18px]" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Coupons;
