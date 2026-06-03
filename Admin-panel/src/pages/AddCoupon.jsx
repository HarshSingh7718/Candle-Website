import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { useCreateCoupon } from '../hooks/useCoupons';

const AddCoupon = () => {
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const { mutateAsync: createCoupon, isPending } = useCreateCoupon();

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderValue: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true,
  });

  useEffect(() => {
    gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
  }, []);

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
    if (!form.discountValue || Number(form.discountValue) <= 0) return toast.error('Discount value must be greater than 0');
    if (form.discountType === 'percentage' && Number(form.discountValue) > 100) return toast.error('Percentage cannot exceed 100');
    if (!form.startDate) return toast.error('Start date is required');
    if (!form.endDate) return toast.error('End date is required');
    if (new Date(form.endDate) <= new Date(form.startDate)) return toast.error('End date must be after start date');

    const payload = {
      code: form.code.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscountAmount: form.discountType === 'percentage' && form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
      startDate: form.startDate,
      endDate: form.endDate,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      isActive: form.isActive,
    };

    try {
      await createCoupon(payload);
      navigate('/coupons');
    } catch (err) {
      // Error toast handled by hook
    }
  };

  return (
    <main className="flex-1 p-6 md:p-margin-page max-w-container-max mx-auto w-full opacity-0" ref={mainRef}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-stack-lg">
        <button onClick={() => navigate('/coupons')} className="p-2 hover:bg-surface-container rounded-lg transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <div>
          <h2 className="font-heading text-headline-lg text-on-surface mb-1">Create Coupon</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Configure a new promotional discount code.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 md:p-8 shadow-sm max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Code */}
          <div className="md:col-span-2">
            <label className="block font-label-md text-label-md text-on-surface mb-2">Coupon Code *</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. SUMMER20"
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all uppercase placeholder:normal-case font-heading tracking-widest"
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">Discount Type *</label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">
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
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Max Discount Amount (only for percentage) */}
          {form.discountType === 'percentage' && (
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">Max Discount Cap (₹)</label>
              <input
                type="number"
                name="maxDiscountAmount"
                value={form.maxDiscountAmount}
                onChange={handleChange}
                placeholder="e.g. 500"
                min="0"
                className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <p className="text-xs text-on-surface-variant mt-1.5">Limits the max ₹ discount even if percentage yields more.</p>
            </div>
          )}

          {/* Min Order Value */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">Min Order Value (₹)</label>
            <input
              type="number"
              name="minOrderValue"
              value={form.minOrderValue}
              onChange={handleChange}
              placeholder="e.g. 999"
              min="0"
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">Start Date *</label>
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">End Date *</label>
            <input
              type="datetime-local"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              min={form.startDate}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
            />
          </div>

          {/* Usage Limit */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">Usage Limit</label>
            <input
              type="number"
              name="usageLimit"
              value={form.usageLimit}
              onChange={handleChange}
              placeholder="Leave blank for unlimited"
              min="1"
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
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
                <div className={`block w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-surface-variant border border-outline-variant'}`}></div>
                <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${form.isActive ? 'bg-surface-container-lowest translate-x-4' : 'bg-on-surface-variant'}`}></div>
              </div>
              <span className="font-label-md text-label-md text-on-surface">
                {form.isActive ? 'Active' : 'Inactive'}
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-surface-variant">
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3 px-8 rounded-lg shadow-sm transition-all border-b-2 border-primary-container hover:border-surface-tint cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Creating...' : 'Create Coupon'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/coupons')}
            className="py-3 px-8 border border-outline-variant text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
};

export default AddCoupon;
