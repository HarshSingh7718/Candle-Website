import React, { useState, useMemo } from 'react';
import {
  ChevronDown, Search, HelpCircle, CreditCard, Truck, CheckCircle2, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageBanner from '../components/ui/PageBanner';

// Custom Hooks
import { useCart } from '../hooks/useCart';
import { useCheckout } from '../hooks/useCheckout';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal"
];

const Checkout = () => {
  const navigate = useNavigate();

  // Connect to our Hooks
  const { cart, isLoading: isCartLoading } = useCart();
  const { createOrder, initRazorpay, verifyPayment, isPlacingOrder } = useCheckout();

  // Form States
  const [shippingAddress, setShippingAddress] = useState({
    country: "India", firstName: "", lastName: "", address: "",
    apartment: "", city: "", state: "Uttarakhand", pinCode: "", phone: ""
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Real Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const isCustom = item.type === "custom";
      const productData = isCustom ? item.customCandle : item.product;
      const price = isCustom ? productData?.totalPrice : (productData?.discountPrice || productData?.price || 0);
      return acc + (price * item.quantity);
    }, 0);
  }, [cart]);

  // If subtotal is greater than 999, shipping is free (matching your backend logic)
  const shippingCost = subtotal > 999 ? 0 : 99;
  const taxes = subtotal * 0.05; // 5% tax matching your backend
  const totalAmount = Math.round(subtotal + shippingCost + taxes);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(val);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  // --- THE MASTER CHECKOUT FUNCTION ---
  const handleCheckout = async () => {
    // 1. Basic Validation
    if (!shippingAddress.firstName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.pinCode || !shippingAddress.phone) {
      return toast.error("Please fill in all required shipping details.");
    }
    if (cart.length === 0) return toast.error("Your cart is empty!");

    const orderPayload = {
      address: shippingAddress.address + (shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ''),
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pinCode,
      phone: shippingAddress.phone,
      paymentMethod: paymentMethod === 'paytm' ? 'razorpay' : paymentMethod, // Assuming paytm routes through razorpay for now
    };

    try {
      // 2a. FLOW: CASH ON DELIVERY
      if (paymentMethod === 'cod') {
        await createOrder(orderPayload);
        toast.success("Order placed successfully!");
        navigate('/orders');
        return;
      }

      // 2b. FLOW: RAZORPAY
      if (paymentMethod === 'razorpay' || paymentMethod === 'paytm') {
        // Step 1: Initialize Razorpay order on backend
        const rpOrder = await initRazorpay({ amount: totalAmount });

        // Step 2: Open Razorpay Window
        const options = {
          key: "YOUR_RAZORPAY_KEY_ID", // TODO: Replace with your actual key or import.meta.env.VITE_RAZORPAY_KEY_ID
          amount: rpOrder.order.amount,
          currency: "INR",
          name: "Naisha Creations",
          description: "Premium Candles",
          order_id: rpOrder.order.id,
          handler: async function (response) {
            try {
              // Step 3: Verify Payment Signature
              await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              // Step 4: Create Order in DB
              await createOrder({
                ...orderPayload,
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              });

              toast.success("Payment successful! Order placed.");
              navigate('/orders');
            } catch (err) {
              toast.error("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            contact: shippingAddress.phone,
          },
          theme: { color: "#D19D94" }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error("Payment failed: " + response.error.description);
        });
        rzp.open();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong during checkout.");
    }
  };

  if (isCartLoading) return <div className="py-20 text-center">Loading checkout...</div>;

  return (
    <div className="md:overflow-hidden bg-white text-slate-800 font-sans flex flex-col">
      <PageBanner title="Checkout" currentPage="Checkout" />
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row flex-1 h-full w-full">

        {/* LEFT COLUMN: Checkout Form */}
        <div className="w-full md:w-[58%] p-6 md:p-12 border-r border-gray-100 md:h-full md:overflow-y-auto bg-white">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold mb-6">Delivery</h1>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="firstName" placeholder="First name" value={shippingAddress.firstName} onChange={handleShippingChange} className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400" />
                <input type="text" name="lastName" placeholder="Last name" value={shippingAddress.lastName} onChange={handleShippingChange} className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400" />
              </div>

              <div className="relative">
                <input type="text" name="address" placeholder="Address" value={shippingAddress.address} onChange={handleShippingChange} className="w-full p-3.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400" />
              </div>

              <input type="text" name="apartment" placeholder="Apartment, suite, etc. (optional)" value={shippingAddress.apartment} onChange={handleShippingChange} className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" name="city" placeholder="City" value={shippingAddress.city} onChange={handleShippingChange} className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400" />
                <div className="relative">
                  <label className="absolute left-3 top-1.5 text-[11px] text-gray-500 font-medium">State</label>
                  <select name="state" value={shippingAddress.state} onChange={handleShippingChange} className="w-full pt-6 pb-2 px-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white">
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-5 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                <input type="text" name="pinCode" placeholder="PIN code" value={shippingAddress.pinCode} onChange={handleShippingChange} className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400" />
              </div>

              <div className="relative">
                <input type="text" name="phone" placeholder="Phone" value={shippingAddress.phone} onChange={handleShippingChange} className="w-full p-3.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400" />
              </div>
            </div>
          </header>

          {/* Payment Section */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-1">Payment</h2>
            <p className="text-sm text-gray-500 mb-4">All transactions are secure and encrypted.</p>

            <div className="border border-gray-200 rounded-md overflow-hidden">
              {/* Razorpay Option */}
              <div className={`p-4 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'bg-stone-50' : 'bg-white'}`} onClick={() => setPaymentMethod('razorpay')}>
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-stone-800' : 'border-gray-300'}`}>
                    {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 bg-stone-800 rounded-full" />}
                  </div>
                  <span className="text-sm font-medium">Razorpay Secure (UPI, Cards, Wallets)</span>
                </div>
                {paymentMethod === 'razorpay' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <div className="bg-gray-100/50 p-4 rounded-md">
                      <p className="text-sm text-gray-600">You'll be redirected to Razorpay to complete your purchase securely.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* COD Option */}
              <div className={`p-4 border-t border-gray-200 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'bg-stone-50' : 'bg-white'}`} onClick={() => setPaymentMethod('cod')}>
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-stone-800' : 'border-gray-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-stone-800 rounded-full" />}
                  </div>
                  <span className="text-sm font-medium">Cash on Delivery (COD)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Pay Now Button */}
          <button
            disabled={isPlacingOrder || cart.length === 0}
            onClick={handleCheckout}
            className="w-full py-4 bg-[#D19D94] hover:bg-[#C28C83] disabled:bg-gray-300 text-white font-semibold rounded-md transition-colors text-lg shadow-sm cursor-pointer"
          >
            {isPlacingOrder ? "Processing..." : (paymentMethod === 'cod' ? "Place Order" : "Pay Now")}
          </button>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="w-full md:w-[42%] bg-gray-50/50 p-6 md:p-12 md:h-full md:overflow-y-auto border-l border-gray-100">
          <div className="space-y-6 mb-8">
            {cart.map(item => {
              // Dynamic logic for Custom vs Simple candles
              const isCustom = item.type === "custom";
              const productData = isCustom ? item.customCandle : item.product;

              const displayName = isCustom ? "Customized Candle" : productData?.name;
              const displayPrice = isCustom ? productData?.totalPrice : (productData?.discountPrice || productData?.price || 0);
              const displayImage = isCustom ? "/placeholder.jpg" : (productData?.images?.[0]?.url || "/placeholder.jpg");

              return (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-md p-0.5 overflow-hidden">
                      <img src={displayImage} alt={displayName} className="w-full h-full object-cover rounded" />
                      <div className="absolute -top-2 -right-2 bg-stone-800 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{displayName}</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(displayPrice * item.quantity)}</span>
                </div>
              )
            })}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal · {cart.length} items</span>
              <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span className="text-gray-800">{shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxes (5%)</span>
              <span className="text-gray-800">{formatCurrency(taxes)}</span>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-bold">Total</span>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 mr-2">INR</span>
                <span className="text-2xl font-bold tracking-tight">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;