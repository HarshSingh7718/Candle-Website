import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, Plus, Trash2, ShieldAlert, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useGetProducts } from '../hooks/useProducts';
import { useCreateManualOrder } from '../hooks/useOrders';

const CreateManualOrder = () => {
  const navigate = useNavigate();
  const mainRef = useRef(null);

  // Recipient details (plain fields only — no customer account / search UI)
  const [recipient, setRecipient] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Product selection & search
  const [productSearch, setProductSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Single payment selector ("Paid" or "COD" — do not model method & status separately)
  const [paymentStatus, setPaymentStatus] = useState('Paid');

  // Shipping & Logistics
  const [shippingPrice, setShippingPrice] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [packaging, setPackaging] = useState('medium');
  const [weight, setWeight] = useState('0.5');
  const [forceCreate, setForceCreate] = useState(false);

  // Admin notes
  const [adminNotes, setAdminNotes] = useState('');

  // Submit guard flag for double-click prevention
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries & Mutations
  const { data: searchData, isLoading: isSearchingProducts } = useGetProducts(1, 10, productSearch);
  const searchResults = searchData?.products || [];

  const { mutateAsync: createManualOrder, isPending } = useCreateManualOrder();

  useEffect(() => {
    gsap.fromTo(mainRef.current, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
  }, []);

  const handleRecipientChange = (e) => {
    const { name, value } = e.target;
    setRecipient((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = (product) => {
    const catalogPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          image: product.images?.[0]?.url || '',
          stock: product.stock ?? 0,
          catalogPrice: catalogPrice,
          overridePrice: catalogPrice,
          quantity: 1
        }
      ];
    });

    setProductSearch('');
    setShowSearchResults(false);
    toast.success(`Added "${product.name}"`);
  };

  const handleQuantityChange = (productId, newQty) => {
    const qty = Math.max(1, parseInt(newQty) || 1);
    setSelectedItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: qty } : item))
    );
  };

  const handleOverridePriceChange = (productId, newPrice) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, overridePrice: newPrice } : item))
    );
  };

  const handleRemoveItem = (productId) => {
    setSelectedItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Calculations
  const subtotal = selectedItems.reduce((acc, item) => {
    const linePrice = item.overridePrice !== '' && !isNaN(Number(item.overridePrice))
      ? Number(item.overridePrice)
      : item.catalogPrice;
    return acc + linePrice * item.quantity;
  }, 0);

  const shipFee = Math.max(0, Number(shippingPrice) || 0);
  const discVal = Math.max(0, Number(discountAmount) || 0);
  const grandTotal = Math.max(0, Math.round(subtotal - discVal + shipFee));

  const hasStockWarning = selectedItems.some((item) => item.quantity > item.stock);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || isPending) return;

    // Basic Validation
    if (!recipient.firstName.trim()) return toast.error('First name is required');
    if (!recipient.phone.trim()) return toast.error('Phone number is required');
    if (!recipient.address.trim()) return toast.error('Street address is required');
    if (!recipient.city.trim()) return toast.error('City is required');
    if (!recipient.state.trim()) return toast.error('State is required');
    if (!recipient.pincode.trim()) return toast.error('Pincode is required');
    if (selectedItems.length === 0) return toast.error('Please select at least one product');

    setIsSubmitting(true);

    const payload = {
      customer: {
        firstName: recipient.firstName.trim(),
        lastName: recipient.lastName.trim(),
        phone: recipient.phone.trim(),
        email: recipient.email.trim(),
        address: recipient.address.trim(),
        city: recipient.city.trim(),
        state: recipient.state.trim(),
        pincode: recipient.pincode.trim()
      },
      items: selectedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        overridePrice: item.overridePrice !== '' && !isNaN(Number(item.overridePrice))
          ? Number(item.overridePrice)
          : item.catalogPrice
      })),
      paymentStatus, // "Paid" or "COD"
      shippingPrice: shipFee,
      discountAmount: discVal,
      packaging,
      weight: Number(weight) || 0.5,
      forceCreate,
      adminNotes: adminNotes.trim()
    };

    try {
      await createManualOrder(payload);
      navigate('/orders');
    } catch (err) {
      // Error toast handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full opacity-0 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-stack-lg">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-bg-muted rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="text-text-muted" />
        </button>
        <div>
          <h2 className="font-heading text-headline-lg text-text-base mb-1">Create Manual Order</h2>
          <p className="font-body-md text-body-md text-text-muted">
            Create direct orders for customers without requiring an account (e.g. WhatsApp / Social Media).
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Sections 1 to 5 */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: RECIPIENT DETAILS */}
          <div className="bg-bg-surface border border-bg-muted rounded-xl p-6 md:p-8 shadow-sm">
            <h3 className="font-heading text-headline-sm text-text-base mb-4 pb-3 border-b border-bg-muted flex items-center gap-2">
              <span>1. Recipient Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-md text-label-md text-text-base mb-1.5">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={recipient.firstName}
                  onChange={handleRecipientChange}
                  placeholder="e.g. Priyanka"
                  className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-text-base mb-1.5">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={recipient.lastName}
                  onChange={handleRecipientChange}
                  placeholder="e.g. Sharma"
                  className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-text-base mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={recipient.phone}
                  onChange={handleRecipientChange}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-label-md text-label-md text-text-base mb-1.5">
                  Email Address <span className="text-xs text-text-muted font-normal">(Optional — confirmation email sends if provided)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={recipient.email}
                  onChange={handleRecipientChange}
                  placeholder="e.g. customer@example.com"
                  className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-label-md text-label-md text-text-base mb-1.5">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={recipient.address}
                  onChange={handleRecipientChange}
                  placeholder="House/Flat No., Building Name, Street, Area"
                  className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-text-base mb-1.5">City *</label>
                <input
                  type="text"
                  name="city"
                  value={recipient.city}
                  onChange={handleRecipientChange}
                  placeholder="e.g. Mumbai"
                  className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-text-base mb-1.5">State *</label>
                <input
                  type="text"
                  name="state"
                  value={recipient.state}
                  onChange={handleRecipientChange}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-text-base mb-1.5">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={recipient.pincode}
                  onChange={handleRecipientChange}
                  placeholder="e.g. 400001"
                  className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PRODUCTS */}
          <div className="bg-bg-surface border border-bg-muted rounded-xl p-6 md:p-8 shadow-sm">
            <h3 className="font-heading text-headline-sm text-text-base mb-4 pb-3 border-b border-bg-muted">
              2. Product Line Items
            </h3>

            {/* Search Box */}
            <div className="relative mb-6">
              <label className="block font-label-md text-label-md text-text-base mb-1.5">Search & Add Product</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  value={productSearch}
                  onFocus={() => setShowSearchResults(true)}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowSearchResults(true);
                  }}
                  placeholder="Search catalog products by name..."
                  className="w-full pl-10 pr-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && productSearch.trim().length > 0 && (
                <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-bg-surface border border-bg-muted rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-bg-muted">
                  {isSearchingProducts ? (
                    <div className="p-4 text-center text-text-muted text-xs">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-text-muted text-xs">No products found matching "{productSearch}"</div>
                  ) : (
                    searchResults.map((prod) => (
                      <div
                        key={prod._id}
                        onClick={() => handleAddProduct(prod)}
                        className="p-3 hover:bg-bg-canvas flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {prod.images?.[0]?.url ? (
                            <img src={prod.images[0].url} alt="" className="w-10 h-10 object-cover rounded-md" />
                          ) : (
                            <div className="w-10 h-10 bg-bg-muted rounded-md flex items-center justify-center text-text-muted">
                              <ShoppingBag size={18} />
                            </div>
                          )}
                          <div>
                            <p className="font-label-md text-text-base text-sm">{prod.name}</p>
                            <p className="text-xs text-text-muted">
                              Stock: <span className="font-mono font-semibold">{prod.stock}</span> | Catalog Price: ₹{prod.discountPrice > 0 ? prod.discountPrice : prod.price}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-md text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Plus size={14} /> Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Line Items Table */}
            {selectedItems.length === 0 ? (
              <div className="p-8 border border-dashed border-bg-muted rounded-xl text-center text-text-muted text-sm">
                No products added yet. Use the search bar above to add items to this order.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="hidden sm:grid grid-cols-12 gap-4 pb-2 border-b border-bg-muted text-xs font-bold text-text-muted uppercase tracking-wider">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-3">Unit Price (₹)</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {selectedItems.map((item) => {
                  const currentUnitPrice = item.overridePrice !== '' && !isNaN(Number(item.overridePrice))
                    ? Number(item.overridePrice)
                    : item.catalogPrice;
                  const itemTotal = currentUnitPrice * item.quantity;
                  const isStockExceeded = item.quantity > item.stock;

                  return (
                    <div
                      key={item.productId}
                      className={`p-4 border rounded-xl transition-all ${
                        isStockExceeded ? 'border-warning/40 bg-warning/5' : 'border-bg-muted bg-bg-surface'
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="sm:col-span-5 flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />
                          ) : (
                            <div className="w-12 h-12 bg-bg-muted rounded-lg flex items-center justify-center text-text-muted shrink-0">
                              <ShoppingBag size={20} />
                            </div>
                          )}
                          <div>
                            <p className="font-label-md text-text-base text-sm font-semibold">{item.name}</p>
                            <p className="text-xs text-text-muted">
                              Catalog Price: ₹{item.catalogPrice} | Available: {item.stock}
                            </p>
                            {isStockExceeded && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-warning mt-1">
                                <ShieldAlert size={13} /> Exceeds catalog stock ({item.stock})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="sm:col-span-2 flex items-center justify-center">
                          <div className="flex items-center border border-bg-muted rounded-lg overflow-hidden bg-bg-canvas">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="px-2.5 py-1 text-text-muted hover:bg-bg-surface font-bold text-sm transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                              className="w-12 text-center py-1 text-sm font-bold bg-transparent border-x border-bg-muted focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="px-2.5 py-1 text-text-muted hover:bg-bg-surface font-bold text-sm transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Price Override Input */}
                        <div className="sm:col-span-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={item.overridePrice}
                              onChange={(e) => handleOverridePriceChange(item.productId, e.target.value)}
                              placeholder={`Catalog: ${item.catalogPrice}`}
                              className="w-full pl-7 pr-3 py-2 border border-bg-muted rounded-lg bg-bg-surface text-sm text-text-base focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            />
                          </div>
                        </div>

                        {/* Total & Action */}
                        <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3">
                          <span className="font-bold text-text-base text-sm font-mono">₹{itemTotal}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                            title="Remove line item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 3: PAYMENT */}
          <div className="bg-bg-surface border border-bg-muted rounded-xl p-6 md:p-8 shadow-sm">
            <h3 className="font-heading text-headline-sm text-text-base mb-4 pb-3 border-b border-bg-muted">
              3. Payment Status
            </h3>
            {/* 
              NOTE: Single select for "Paid" or "COD".
              Do NOT apply the storefront's ₹5,000 COD fraud-prevention cap here — this is a deliberate, explicit exception for admin-created orders.
            */}
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentStatus === 'Paid'
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                    : 'border-bg-muted bg-bg-surface text-text-muted hover:border-brand-primary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="Paid"
                    checked={paymentStatus === 'Paid'}
                    onChange={() => setPaymentStatus('Paid')}
                    className="accent-brand-primary"
                  />
                  <div>
                    <p className="font-bold text-sm text-text-base">Paid (Prepaid)</p>
                    <p className="text-xs text-text-muted">Payment received upfront via UPI / Bank / Cash</p>
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentStatus === 'COD'
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                    : 'border-bg-muted bg-bg-surface text-text-muted hover:border-brand-primary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="COD"
                    checked={paymentStatus === 'COD'}
                    onChange={() => setPaymentStatus('COD')}
                    className="accent-brand-primary"
                  />
                  <div>
                    <p className="font-bold text-sm text-text-base">COD (Cash on Delivery)</p>
                    <p className="text-xs text-text-muted">Payment collected at delivery time</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* SECTION 4: SHIPPING & LOGISTICS */}
          <div className="bg-bg-surface border border-bg-muted rounded-xl p-6 md:p-8 shadow-sm">
            <h3 className="font-heading text-headline-sm text-text-base mb-4 pb-3 border-b border-bg-muted">
              4. Shipping & Logistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-md text-label-md text-text-base mb-1.5">Shipping Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={shippingPrice}
                  onChange={(e) => setShippingPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-mono"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-text-base mb-1.5">Flat Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-mono"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-text-base mb-1.5">Shiprocket Packaging Size</label>
                <select
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer capitalize"
                >
                  <option value="small">Small (12.7 x 12.7 x 12.7 cm)</option>
                  <option value="medium">Medium (15.24 x 15.24 x 15.24 cm)</option>
                  <option value="large">Large (28 x 15.24 x 12.7 cm)</option>
                </select>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-text-base mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.5"
                  className="w-full px-4 py-3 border border-bg-muted rounded-lg bg-bg-surface text-text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-mono"
                />
              </div>

              {/* Force Create Checkbox */}
              <div className="sm:col-span-2 pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-bg-muted bg-bg-canvas cursor-pointer hover:bg-bg-surface-hover transition-colors">
                  <input
                    type="checkbox"
                    checked={forceCreate}
                    onChange={(e) => setForceCreate(e.target.checked)}
                    className="mt-1 rounded text-brand-primary focus:ring-brand-primary/20 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-sm text-text-base block">
                      Force Create / Bypass Serviceability Check
                    </span>
                    <span className="text-xs text-text-muted">
                      Check this for hand-delivery, local pickup, or unserviced pincodes that bypass Shiprocket courier coverage.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 5: ADMIN NOTES */}
          <div className="bg-bg-surface border border-bg-muted rounded-xl p-6 md:p-8 shadow-sm">
            <h3 className="font-heading text-headline-sm text-text-base mb-4 pb-3 border-b border-bg-muted">
              5. Admin Notes (Optional)
            </h3>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Order placed via Instagram DM. Promised delivery by Saturday."
              className="w-full p-4 border border-bg-muted rounded-lg bg-bg-surface text-text-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {/* Right Column: ORDER SUMMARY Sidebar (Section 6) */}
        <div className="space-y-6">
          <div className="bg-bg-surface border border-bg-muted rounded-xl p-6 shadow-sm sticky top-6">
            <h3 className="font-heading text-headline-sm text-text-base mb-4 pb-3 border-b border-bg-muted">
              Order Summary
            </h3>

            {/* Stock Exceeded Alert Banner */}
            {hasStockWarning && (
              <div className="p-3 mb-4 rounded-lg bg-warning/10 border border-warning/30 text-warning text-xs flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>
                  <strong>Stock Warning:</strong> 1 or more line items exceed current catalog stock. Order can still be created by admin.
                </span>
              </div>
            )}

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-text-muted">
                <span>Items Subtotal</span>
                <span className="font-mono text-text-base font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>

              {discVal > 0 && (
                <div className="flex justify-between text-success font-medium">
                  <span>Discount</span>
                  <span className="font-mono">-₹{discVal.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-text-muted">
                <span>Shipping Fee</span>
                <span className="font-mono text-text-base font-semibold">₹{shipFee.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-bg-muted flex justify-between items-center">
                <span className="font-bold text-base text-text-base">Grand Total</span>
                <span className="font-bold text-xl text-brand-primary font-mono">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Summary Highlights */}
            <div className="p-3 rounded-lg bg-bg-canvas border border-bg-muted text-xs space-y-1 mb-6 text-text-muted">
              <p>• <strong>Payment:</strong> <span className="uppercase text-text-base">{paymentStatus}</span></p>
              <p>• <strong>Recipient:</strong> {recipient.firstName || 'Not specified'}</p>
              <p>• <strong>Pincode:</strong> {recipient.pincode || 'Not specified'}</p>
              <p>• <strong>Items Count:</strong> {selectedItems.reduce((acc, i) => acc + i.quantity, 0)} units</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isPending || selectedItems.length === 0}
              className="w-full py-4 bg-brand-primary text-text-on-brand font-label-md text-label-md rounded-xl hover:bg-coffee-800 transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting || isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Create Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default CreateManualOrder;
