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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageBanner from "../components/ui/PageBanner";

// Custom Hooks
import { useCart } from "../hooks/useCart";
import { useCheckout } from "../hooks/useCheckout";
import { useUser } from "../hooks/useAuth";
import { useAddress } from "../hooks/useAddress";
import { usePincodeLookup } from "../hooks/usePincodeLookup";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import SEO from "../components/SEO";

const Checkout = () => {
  const navigate = useNavigate();

  // --- Data Fetching ---
  const { data: user } = useUser();
  // 👉 1. Destructured the billing object from useCart
  const { cart, billing, isLoading: isCartLoading } = useCart();
  const { createOrder, initRazorpay, verifyPayment, isPlacingOrder } =
    useCheckout();

  const { addAddress, isAdding } = useAddress();
  const { lookupPincode, isLookingUp, pincodeError } = usePincodeLookup();

  // --- State ---
  const savedAddresses = user?.addresses || [];
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(
    savedAddresses.length === 0,
  );
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [shippingAddress, setShippingAddress] = useState({
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

  // --- Effects ---
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddr =
        savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddressId(defaultAddr._id);
      setShowNewAddressForm(false);
    } else if (savedAddresses.length === 0) {
      setShowNewAddressForm(true);
    }
  }, [savedAddresses, selectedAddressId]);

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
      address: selected.address,
      city: selected.city,
      state: selected.state,
      pincode: selected.pincode,
      phone: selected.phone,
      paymentMethod,
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
      <div className="bg-white text-slate-800 font-sans flex flex-col">
        <PageBanner title="Checkout" currentPage="Checkout" />

        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row flex-1 h-full w-full">
          {/* LEFT COLUMN: Delivery & Payment */}
          <div className="w-full md:w-[58%] p-6 md:p-12 border-r border-gray-100 bg-white">
            <header className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Delivery Address</h1>
                {savedAddresses.length > 0 &&
                  !showNewAddressForm &&
                  !isAddressExpanded && (
                    <button
                      onClick={() => setIsAddressExpanded(true)}
                      className="text-sm font-medium text-[#D19D94] underline cursor-pointer"
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
                          ? "border-stone-800 bg-stone-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedAddressId === addr._id
                              ? "border-stone-800"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAddressId === addr._id && (
                            <div className="w-2 h-2 bg-stone-800 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold text-sm">
                              {addr.firstName} {addr.lastName}
                            </p>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded font-bold uppercase">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
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
                      className="text-sm font-medium text-[#D19D94] flex items-center gap-1 mt-4"
                    >
                      <Plus size={16} /> Add a new address
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  {savedAddresses.length > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-800">New Address</h3>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={shippingAddress.firstName}
                      onChange={handleShippingChange}
                      className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={shippingAddress.lastName}
                      onChange={handleShippingChange}
                      className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      name="flat"
                      placeholder="Flat, House no., Building, Company, Apartment"
                      value={shippingAddress.flat}
                      onChange={handleShippingChange}
                      className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400"
                    />
                    <input
                      type="text"
                      name="area"
                      placeholder="Area, Street, Sector, Village"
                      value={shippingAddress.area}
                      onChange={handleShippingChange}
                      className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400"
                    />
                    <input
                      type="text"
                      name="landmark"
                      placeholder="Landmark (Optional) E.g. Near Apollo Hospital"
                      value={shippingAddress.landmark}
                      onChange={handleShippingChange}
                      className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400"
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
                          pincodeError ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {isLookingUp && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-5 h-5 animate-spin text-[#D19D94]" />
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={shippingAddress.city}
                      readOnly
                      className="w-full p-3.5 border border-gray-100 bg-gray-50 rounded-md"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={shippingAddress.state}
                      readOnly
                      className="w-full p-3.5 border border-gray-100 bg-gray-50 rounded-md"
                    />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    className="w-full p-3.5 border border-gray-300 rounded-md"
                  />
                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={isAdding}
                      className="px-8 py-3 bg-stone-800 text-white rounded-md disabled:bg-stone-400 cursor-pointer"
                    >
                      {isAdding ? "Saving..." : "Save Address"}
                    </button>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="px-8 py-3 border border-gray-300 text-gray-600 rounded-md"
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
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div
                  className={`p-4 cursor-pointer flex items-center space-x-3 ${
                    paymentMethod === "razorpay" ? "bg-stone-50" : "bg-white"
                  }`}
                  onClick={() => setPaymentMethod("razorpay")}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === "razorpay"
                        ? "border-stone-800"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "razorpay" && (
                      <div className="w-2.5 h-2.5 bg-stone-800 rounded-full" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    Razorpay Secure (Cards, UPI, Netbanking)
                  </span>
                </div>
                <div
                  className={`p-4 border-t border-gray-200 cursor-pointer flex items-center space-x-3 ${
                    paymentMethod === "cod" ? "bg-stone-50" : "bg-white"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === "cod"
                        ? "border-stone-800"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "cod" && (
                      <div className="w-2.5 h-2.5 bg-stone-800 rounded-full" />
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
              className="w-full py-4 bg-black hover:bg-black/85 disabled:bg-gray-300 text-white font-semibold rounded-md transition-colors text-lg shadow-sm cursor-pointer"
            >
              {isPlacingOrder
                ? "Processing..."
                : paymentMethod === "cod"
                  ? "Place Order"
                  : "Pay Now"}
            </button>
          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="w-full md:w-[42%] bg-gray-50/50 p-6 md:p-12 border-l border-gray-100">
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
                      <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-md overflow-hidden">
                        <img
                          src={displayImage}
                          alt="product"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute -top-2 -right-2 bg-stone-800 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-800">
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

            <div className="space-y-3 mb-6 pt-6 border-t border-gray-200">
              {/* 👉 3. Mapped direct billing values here */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(billing?.itemsPrice || 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>
                  {billing?.shippingPrice === 0
                    ? "Free"
                    : formatCurrency(billing?.shippingPrice || 0)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-4 text-lg font-bold border-t border-gray-100">
                <span>Total</span>
                <div className="text-right flex items-baseline gap-2">
                  {formatCurrency(billing?.totalPrice || 0)}
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
