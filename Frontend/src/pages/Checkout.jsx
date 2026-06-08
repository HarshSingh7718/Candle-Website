import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Search,
  HelpCircle,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  Plus,
  Loader2,
  Tag,
  X,
  Percent,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Custom Hooks
import { useCart } from "../hooks/useCart";
import { useCheckout } from "../hooks/useCheckout";
import { useUser } from "../hooks/useAuth";
import { useAddress } from "../hooks/useAddress";
import { usePincodeLookup } from "../hooks/usePincodeLookup";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import { useCoupon } from "../hooks/useCoupon";
import SEO from "../components/SEO";

const Checkout = () => {
  const navigate = useNavigate();

  // --- Data Fetching ---
  const { data: user, isLoading: isUserLoading } = useUser();
  // 👉 1. Destructured the billing object from useCart
  const { cart, billing, isLoading: isCartLoading } = useCart();
  const { createOrder, initRazorpay, verifyPayment, isPlacingOrder } =
    useCheckout();

  const { addAddress, isAdding } = useAddress();
  const { lookupPincode, isLookingUp, pincodeError, isManualEntryEnabled } = usePincodeLookup();

  // --- State ---
  const savedAddresses = user?.addresses || [];
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  // --- Coupon State ---
  const [couponCode, setCouponCode] = useState("");
  const { applyCoupon, removeCoupon, appliedCoupon, discountAmount, isApplying, availableCoupons, isLoadingCoupons } = useCoupon();

  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName,
    lastName: user?.lastName,
    flat: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pinCode: "",
    phone: user?.phoneNumber,
  });

  // --- Effects ---
  useEffect(() => {
    if (isUserLoading) return;
    if (!user) return;

    if (savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddr =
        savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddressId(defaultAddr._id);
      setShowNewAddressForm(false);
    } else if (savedAddresses.length === 0) {
      setShowNewAddressForm(true);
    }
  }, [savedAddresses, selectedAddressId, isUserLoading]);

  // 👉 2. Removed the manual subtotal, shippingCost, and totalAmount calculations!

  const displayAddresses = isAddressExpanded
    ? savedAddresses
    : savedAddresses.filter((a) => a._id === selectedAddressId);

  const isSubmitDisabled =
    isPlacingOrder || cart.length === 0 || showNewAddressForm;

  // --- Helpers ---
  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(val);

  // --- Handlers ---
  const handleShippingChange = async (e) => {
    const { name, value } = e.target;
    if (name === "pinCode") {
      const val = value.replace(/\D/g, "").slice(0, 6);
      setShippingAddress((prev) => ({ ...prev, pinCode: val }));
      if (val.length === 6) {
        const locationData = await lookupPincode(val);
        if (locationData) {
          setShippingAddress((prev) => ({
            ...prev,
            city: locationData.city,
            state: locationData.state,
          }));
        }
      }
    } else {
      setShippingAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveAddress = async (e) => {
    if (e) e.preventDefault();
    const {
      firstName,
      address,
      city,
      state,
      pinCode,
      phone,
      apartment,
      lastName,
    } = shippingAddress;

    const isMissingFields =
      !shippingAddress.firstName?.trim() ||
      !shippingAddress.flat?.trim() ||
      !shippingAddress.area?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.state?.trim() ||
      !shippingAddress.pinCode?.trim() ||
      !shippingAddress.phone?.trim();

    if (isMissingFields) {
      toast.error("Please fill in all required shipping details.");
      return;
    }

    if (shippingAddress.pinCode.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit Pincode.");
      return;
    }

    const combinedAddress = [
      shippingAddress.flat?.trim(),
      shippingAddress.area?.trim(),
      shippingAddress.landmark?.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    const finalAddress = {
      firstName: shippingAddress.firstName.trim(),
      lastName: shippingAddress.lastName.trim(),
      address: combinedAddress,
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      pincode: shippingAddress.pinCode.trim(),
      phone: shippingAddress.phone.trim(),
    };

    try {
      await addAddress(finalAddress);
      setShowNewAddressForm(false);
      setShippingAddress({
        firstName: "",
        lastName: "",
        flat: "",
        area: "",
        landmark: "",
        city: "",
        state: "",
        pinCode: "",
        phone: "",
      });
    } catch (err) {
      // Silently catch error to prevent app crash. The hook handles the error toast.
    }
  };

  const handleCheckout = async (e) => {
    if (e) e.preventDefault();
    const selected = savedAddresses.find((a) => a._id === selectedAddressId);

    if (cart.length === 0) return toast.error("Your cart is empty!");
    if (showNewAddressForm || !selected)
      return toast.error("Please verify your shipping address.");

    const orderPayload = {
      firstName: selected.firstName,
      lastName: selected.lastName,
      address: selected.address,
      city: selected.city,
      state: selected.state,
      pincode: selected.pincode,
      phone: selected.phone,
      paymentMethod,
      couponCode: appliedCoupon?.code || undefined,
    };

    try {
      const response = await createOrder(orderPayload);

      // Branch 1: COD
      if (paymentMethod === "cod") {
        toast.success("Order placed successfully!");
        navigate("/account/orders");
        return;
      }

      // Branch 2: Razorpay Handshake
      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        toast.error(
          "Razorpay SDK failed to load. Please check your connection.",
        );
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.razorpayOrder.amount,
        currency: "INR",
        name: "Naisha Creations",
        description: "Premium Candles",
        order_id: response.razorpayOrder.id,
        handler: async (res) => {
          try {
            await verifyPayment({
              orderId: response.orderId,
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
            });
            toast.success("Payment successful! Order confirmed.");
            navigate("/account/orders");
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: `${selected.firstName} ${selected.lastName}`,
          contact: selected.phone,
        },
        theme: { color: "#D19D94" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed.");
    }
  };

  if (isCartLoading)
    return (
      <div className="py-20 text-center font-serif italic text-stone-500">
        Preparing your order...
      </div>
    );

  return (
    <>
      <SEO
        title="Checkout | Naisha Creations"
        description="Complete your purchase securely at Naisha Creations. Fast & reliable delivery. Pay with COD or Razorpay."
      />
      <div className="bg-light-yellow text-paragraph font-sans flex flex-col">

        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row flex-1 h-full w-full">
          {/* LEFT COLUMN: Delivery & Payment */}
          <div className="w-full md:w-[58%] p-6 md:p-12 border-r border-muted/20 bg-light-yellow">
            <header className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Delivery Address</h1>
                {savedAddresses.length > 0 &&
                  !showNewAddressForm &&
                  !isAddressExpanded && (
                    <button
                      onClick={() => setIsAddressExpanded(true)}
                      className="text-sm font-medium text-coffee underline cursor-pointer"
                    >
                      Change
                    </button>
                  )}
              </div>

              {savedAddresses.length > 0 && !showNewAddressForm ? (
                <div className="space-y-4">
                  {displayAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => {
                        setSelectedAddressId(addr._id);
                        setIsAddressExpanded(false);
                      }}
                      className={`p-4 border rounded-md cursor-pointer transition-all ${
                        selectedAddressId === addr._id
                          ? "border-coffee bg-muted/10"
                          : "border-muted/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedAddressId === addr._id
                              ? "border-coffee"
                              : "border-muted/20"
                          }`}
                        >
                          {selectedAddressId === addr._id && (
                            <div className="w-2 h-2 bg-coffee rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold text-sm">
                              {addr.firstName} {addr.lastName}
                            </p>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-muted/20 px-2 py-0.5 rounded font-bold uppercase">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-paragraph">
                            {addr.address}, {addr.city}, {addr.state}{" "}
                            {addr.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isAddressExpanded && (
                    <button
                      onClick={() => setShowNewAddressForm(true)}
                      className="text-sm font-medium text-coffee flex items-center gap-1 mt-4"
                    >
                      <Plus size={16} /> Add a new address
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  {savedAddresses.length > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-heading">New Address</h3>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={shippingAddress.firstName}
                      onChange={handleShippingChange}
                      className="w-full p-3.5 border border-muted rounded-md focus:outline-none focus:ring-1 focus:ring-coffee placeholder:text-muted"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={shippingAddress.lastName}
                      onChange={handleShippingChange}
                      className="w-full p-3.5 border border-muted rounded-md focus:outline-none focus:ring-1 focus:ring-coffee placeholder:text-muted"
                    />
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      name="flat"
                      placeholder="Flat, House no., Building, Company, Apartment"
                      value={shippingAddress.flat}
                      onChange={handleShippingChange}
                      className="w-full p-3.5 border border-muted rounded-md focus:outline-none focus:ring-1 focus:ring-coffee placeholder:text-muted"
                    />
                    <input
                      type="text"
                      name="area"
                      placeholder="Area, Street, Sector, Village"
                      value={shippingAddress.area}
                      onChange={handleShippingChange}
                      className="w-full p-3.5 border border-muted rounded-md focus:outline-none focus:ring-1 focus:ring-coffee placeholder:text-muted"
                    />
                    <input
                      type="text"
                      name="landmark"
                      placeholder="Landmark (Optional) E.g. Near Apollo Hospital"
                      value={shippingAddress.landmark}
                      onChange={handleShippingChange}
                      className="w-full p-3.5 border border-muted rounded-md focus:outline-none focus:ring-1 focus:ring-coffee placeholder:text-muted"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        name="pinCode"
                        placeholder="PIN code"
                        value={shippingAddress.pinCode}
                        onChange={handleShippingChange}
                        className={`w-full p-3.5 border rounded-md ${
                          pincodeError ? "border-danger/50" : "border-muted"
                        }`}
                      />
                      {isLookingUp && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-5 h-5 animate-spin text-coffee" />
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={isManualEntryEnabled ? handleShippingChange : undefined}
                      readOnly={!isManualEntryEnabled}
                      className={`w-full p-3.5 border rounded-md ${
                        isManualEntryEnabled 
                          ? "border-muted focus:outline-none focus:ring-1 focus:ring-coffee" 
                          : "border-muted/20 bg-muted/10"
                      }`}
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={shippingAddress.state}
                      onChange={isManualEntryEnabled ? handleShippingChange : undefined}
                      readOnly={!isManualEntryEnabled}
                      className={`w-full p-3.5 border rounded-md ${
                        isManualEntryEnabled 
                          ? "border-muted focus:outline-none focus:ring-1 focus:ring-coffee" 
                          : "border-muted/20 bg-muted/10"
                      }`}
                    />
                  </div>
                  {isManualEntryEnabled && (
                    <div className="flex items-start gap-2 text-warning bg-warning/10 p-3 rounded-md border border-warning/50 mt-2">
                      <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        {pincodeError || "Pincode lookup failed. Please enter your City and State manually."}
                      </p>
                    </div>
                  )}
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    className="w-full p-3.5 border border-muted rounded-md"
                  />
                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={isAdding}
                      className="px-8 py-3 bg-coffee text-light-yellow rounded-md disabled:bg-muted cursor-pointer"
                    >
                      {isAdding ? "Saving..." : "Save Address"}
                    </button>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="px-8 py-3 border border-muted text-paragraph rounded-md"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </header>

            <section className="mb-10">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="border border-muted/20 rounded-md overflow-hidden">
                <div
                  className={`p-4 cursor-pointer flex items-center space-x-3 ${
                    paymentMethod === "razorpay" ? "bg-muted/10" : "bg-light-yellow"
                  }`}
                  onClick={() => setPaymentMethod("razorpay")}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === "razorpay"
                        ? "border-coffee"
                        : "border-muted"
                    }`}
                  >
                    {paymentMethod === "razorpay" && (
                      <div className="w-2.5 h-2.5 bg-coffee rounded-full" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    Razorpay Secure (Cards, UPI, Netbanking)
                  </span>
                </div>
                <div
                  className={`p-4 border-t border-muted/20 cursor-pointer flex items-center space-x-3 ${
                    paymentMethod === "cod" ? "bg-muted/10" : "bg-light-yellow"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === "cod"
                        ? "border-coffee"
                        : "border-muted"
                    }`}
                  >
                    {paymentMethod === "cod" && (
                      <div className="w-2.5 h-2.5 bg-coffee rounded-full" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    Cash on Delivery (COD)
                  </span>
                </div>
              </div>
            </section>

            <button
              type="button"
              disabled={isSubmitDisabled}
              onClick={handleCheckout}
              className="w-full py-4 bg-coffee hover:bg-coffee-light disabled:bg-muted/50 text-light-yellow font-semibold rounded-md transition-colors text-lg shadow-sm cursor-pointer"
            >
              {isPlacingOrder
                ? "Processing..."
                : paymentMethod === "cod"
                  ? "Place Order"
                  : "Pay Now"}
            </button>
          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="w-full md:w-[42%] bg-muted/5 p-6 md:p-12 border-l border-muted/20">
            <div className="space-y-6 mb-8">
              {cart.map((item) => {
                const isCustom = item.type === "custom";
                const productData = isCustom ? item.customCandle : item.product;
                const displayImage = isCustom
                  ? "/placeholder.jpg"
                  : productData?.images?.[0]?.url || "/placeholder.jpg";
                return (
                  <div
                    key={item._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 bg-light-yellow border border-muted/20 rounded-md overflow-hidden">
                        <img
                          src={displayImage}
                          alt="product"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute -top-2 -right-2 bg-coffee text-light-yellow text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-heading">
                        {isCustom ? "Customized Candle" : productData?.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(
                        (isCustom
                          ? productData?.totalPrice
                          : productData?.discountPrice || productData?.price) *
                          item.quantity,
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ===== COUPON SECTION — Mamaearth/Swiggy Style ===== */}
            <div className="border-t border-muted/20 pt-5 mb-6">
              {appliedCoupon ? (
                /* ── Applied Success Badge ── */
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-success" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-green-800 tracking-wider">{appliedCoupon.code}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Applied</span>
                      </div>
                      <p className="text-xs text-success mt-0.5">You're saving {formatCurrency(discountAmount)} on this order</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { removeCoupon(); setCouponCode(""); }}
                    className="p-1.5 text-success hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  {/* ── Section 1: Available Offers ── */}
                  {!isLoadingCoupons && availableCoupons.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Tag size={12} />
                        Available Offers
                      </h4>
                      <div className="space-y-2.5">
                        {availableCoupons.map((coupon) => (
                          <div
                            key={coupon._id}
                            className="flex items-center justify-between border border-muted/20 rounded-lg px-4 py-3 hover:border-coffee hover:bg-coffee/5 transition-all group"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-muted/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Percent size={16} className="text-paragraph" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-bold tracking-widest text-heading bg-muted/10 px-2 py-0.5 rounded border border-dashed border-muted">
                                    {coupon.code}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-heading leading-snug">{coupon.title}</p>
                                {coupon.description && (
                                  <p className="text-xs text-muted mt-0.5 leading-snug">{coupon.description}</p>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => applyCoupon(coupon.code)}
                              disabled={isApplying}
                              className="shrink-0 ml-3 text-xs font-bold text-paragraph hover:text-heading uppercase tracking-wider px-3 py-1.5 border border-muted rounded-md hover:bg-muted/10 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Section 2: Always-Visible Manual Input ── */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Tag size={12} />
                      {availableCoupons.length > 0 ? 'Or enter a code' : 'Have a promo code?'}
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2.5 border border-muted rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-coffee focus:border-coffee uppercase tracking-wider font-medium placeholder:normal-case placeholder:tracking-normal placeholder:font-normal transition-all"
                      />
                      <button
                        type="button"
                        disabled={!couponCode.trim() || isApplying}
                        onClick={() => applyCoupon(couponCode.trim())}
                        className="px-5 py-2.5 bg-coffee text-light-yellow text-sm font-medium rounded-md hover:bg-coffee-light disabled:bg-muted disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        {isApplying ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3 mb-6 pt-6 border-t border-muted/20">
              {/* 👉 3. Mapped direct billing values here */}
              <div className="flex justify-between text-sm text-paragraph">
                <span>Subtotal</span>
                <span>{formatCurrency(billing?.itemsPrice || 0)}</span>
              </div>
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    Discount ({appliedCoupon.code})
                  </span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-paragraph">
                <span>Shipping</span>
                <span>
                  {billing?.shippingPrice === 0
                    ? "Free"
                    : formatCurrency(billing?.shippingPrice || 0)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-4 text-lg font-bold border-t border-muted/20">
                <span>Total</span>
                <div className="text-right flex items-baseline gap-2">
                  {formatCurrency(
                    Math.max(0, (billing?.totalPrice || 0) - discountAmount)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
