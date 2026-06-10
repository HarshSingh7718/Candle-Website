import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { useGetCoupon, useUpdateCoupon } from '../hooks/useCoupons';

import { ArrowLeft } from 'lucide-react';

const EditCoupon = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const mainRef = useRef(null);
  const { data: coupon, isLoading: isFetching } = useGetCoupon(id);
  const { mutateAsync: updateCoupon, isPending } = useUpdateCoupon();

  const [form, setForm] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderValue: '',
    startDate: '',
    endDate: '',
    usageLimitPerUser: '1',
    isActive: true,
  });

  // Pre-fill form when coupon data loads
  useEffect(() => {
    if (coupon) {
      const toLocalDatetime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const offset = d.getTimezoneOffset();
        const local = new Date(d.getTime() - offset * 60 * 1000);
        return local.toISOString().slice(0, 16);
      };

      setForm({
        code: coupon.code || '',
        title: coupon.title || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue ?? '',
        maxDiscountAmount: coupon.maxDiscountAmount ?? '',
        minOrderValue: coupon.minOrderValue ?? '',
        startDate: toLocalDatetime(coupon.startDate),
        endDate: toLocalDatetime(coupon.endDate),
        usageLimitPerUser: coupon.usageLimitPerUser ?? 1,
        isActive: coupon.isActive ?? true,
      });
    }
  }, [coupon]);

  useEffect(() => {
    if (!isFetching) {
      gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
    }
  }, [isFetching]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) return toast.error('Code is required');
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.discountValue || Number(form.discountValue) <= 0) return toast.error('Discount value must be greater than 0');
    if (form.discountType === 'percentage' && Number(form.discountValue) > 100) return toast.error('Percentage cannot exceed 100');
    if (!form.startDate) return toast.error('Start date is required');
    if (!form.endDate) return toast.error('End date is required');
    if (new Date(form.endDate) <= new Date(form.startDate)) return toast.error('End date must be after start date');

    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscountAmount: form.discountType === 'percentage' && form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
      startDate: form.startDate,
      endDate: form.endDate,
      usageLimitPerUser: form.usageLimitPerUser ? Number(form.usageLimitPerUser) : 1,
      isActive: form.isActive,
    };

    try {
      await updateCoupon({ id, couponData: payload });
      navigate('/coupons');
    } catch (err) {
      // Error toast handled by hook
    }
  };

  if (isFetching) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-margin-page max-w-container-max mx-auto w-full opacity-0" ref={mainRef}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-stack-lg">
        <button onClick={() => navigate('/coupons')} className="p-2 hover:bg-bg-muted rounded-lg transition-colors cursor-pointer">
          <ArrowLeft className=" text-text-muted" />
        </button>
        <div>
          <h2 className="font-heading text-headline-lg text-text-base mb-1">Edit Coupon</h2>
          <p className="font-body-md text-body-md text-text-muted">
            Modify coupon <span className="font-heading font-bold tracking-wider">{coupon?.code}</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-bg-surface border border-bg-muted rounded-xl p-6 md:p-8 shadow-sm max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Code */}
          <div>
            <label className="block font-label-md text-label-md text-text-base mb-2">Coupon Code *</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. SUMMER20"
              className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all uppercase placeholder:normal-case font-heading tracking-widest"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block font-label-md text-label-md text-text-base mb-2">Title * <span className="text-xs text-text-muted font-normal">(shown to customers)</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder='e.g. "Flat 20% Off"'
              className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block font-label-md text-label-md text-text-base mb-2">Description <span className="text-xs text-text-muted font-normal">(shown to customers)</span></label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder='e.g. "On orders above ₹999"'
              className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block font-label-md text-label-md text-text-base mb-2">Discount Type *</label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all cursor-pointer"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block font-label-md text-label-md text-text-base mb-2">
              Discount Value * {form.discountType === 'percentage' ? '(%)' : '(₹)'}
            </label>
            <input
              type="number"
              name="discountValue"
              value={form.discountValue}
              onChange={handleChange}
              placeholder={form.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 200'}
              min="0"
              max={form.discountType === 'percentage' ? '100' : undefined}
              className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>

          {/* Max Discount Amount (only for percentage) */}
          {form.discountType === 'percentage' && (
            <div>
              <label className="block font-label-md text-label-md text-text-base mb-2">Max Discount Cap (₹)</label>
              <input
                type="number"
                name="maxDiscountAmount"
                value={form.maxDiscountAmount}
                onChange={handleChange}
                placeholder="e.g. 500"
                min="0"
                className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
              />
              <p className="text-xs text-text-muted mt-1.5">Limits the max ₹ discount even if percentage yields more.</p>
            </div>
          )}

          {/* Min Order Value */}
          <div>
            <label className="block font-label-md text-label-md text-text-base mb-2">Min Order Value (₹)</label>
            <input
              type="number"
              name="minOrderValue"
              value={form.minOrderValue}
              onChange={handleChange}
              placeholder="e.g. 999"
              min="0"
              className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-label-md text-label-md text-text-base mb-2">Start Date *</label>
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block font-label-md text-label-md text-text-base mb-2">End Date *</label>
            <input
              type="datetime-local"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              min={form.startDate}
              className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all cursor-pointer"
            />
          </div>

          {/* Usage Limit Per User */}
          <div>
            <label className="block font-label-md text-label-md text-text-base mb-2">Usage Limit Per User</label>
            <input
              type="number"
              name="usageLimitPerUser"
              value={form.usageLimitPerUser}
              onChange={handleChange}
              placeholder="Default: 1"
              min="1"
              className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
            <p className="text-xs text-text-muted mt-1.5">How many times each customer can use this coupon.</p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 pt-6">
            <label className="flex items-center cursor-pointer gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-brand-primary' : 'bg-bg-muted border border-bg-muted'}`}></div>
                <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${form.isActive ? 'bg-bg-surface translate-x-4' : 'bg-text-muted'}`}></div>
              </div>
              <span className="font-label-md text-label-md text-text-base">
                {form.isActive ? 'Active' : 'Inactive'}
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-bg-muted">
          <button
            type="submit"
            disabled={isPending}
            className="bg-brand-primary hover:bg-coffee-800 text-text-on-brand font-label-md text-label-md py-3 px-8 rounded-lg shadow-sm transition-all border-b-2 border-coffee-800 hover:border-brand-secondary cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/coupons')}
            className="py-3 px-8 border border-bg-muted text-text-muted font-label-md text-label-md rounded-lg hover:bg-bg-muted transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
};

export default EditCoupon;
