import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronDown, 
  Search, 
  HelpCircle, 
  Tag, 
  Info,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import PageBanner from '../components/ui/PageBanner';

/**
 * Mock Data for dynamic states and address suggestions
 */
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
];

const INITIAL_CART = [
  {
    id: 1,
    name: "Sacred Sanctuary",
    price: 1860,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=100&h=100"
  },
  {
    id: 2,
    name: "Prairie",
    price: 2330, 
    quantity: 2,
    image: "https://images.unsplash.com/photo-1602872030219-cbf917a8cbd8?auto=format&fit=crop&q=80&w=100&h=100"
  }
];

const Checkout = () => {
  // --- Form States ---
  const [shippingAddress, setShippingAddress] = useState({
    country: "India",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "Uttarakhand",
    pinCode: "",
    phone: ""
  });

  const [billingAddress, setBillingAddress] = useState({
    country: "India",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "Uttar Pradesh",
    pinCode: "",
    phone: ""
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [saveInfo, setSaveInfo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [discountCode, setDiscountCode] = useState("");
  
  // Dynamic Search States
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  // --- Calculations ---
  const subtotal = useMemo(() => {
    return INITIAL_CART.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, []);

  const shippingCost = 0; 
  const taxes = 310.48;
  const total = subtotal + shippingCost;

  // Formatting Currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(val);
  };

  // Input Handlers
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({ ...prev, [name]: value }));
  };

  return (
    /* md:h-screen md:overflow-hidden makes the whole page an app-like layout where columns scroll internally */
    <div className=" md:overflow-hidden bg-white text-slate-800 font-sans flex flex-col">
         <PageBanner title="Checkout" currentPage="Checkout" />
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row flex-1 h-full w-full">
        
        {/* LEFT COLUMN: Checkout Form (Scrolls internally, stays visible throughout) */}
        <div className="w-full md:w-[58%] p-6 md:p-12 border-r border-gray-100 md:h-full md:overflow-y-auto bg-white">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold mb-6">Delivery</h1>
            
            <div className="space-y-4">
              {/* Country Selection */}
              <div className="relative group">
                <label className="absolute left-3 top-1.5 text-[11px] text-gray-500 font-medium">Country/Region</label>
                <select 
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleShippingChange}
                  className="w-full pt-6 pb-2 px-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
                >
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                </select>
                <ChevronDown className="absolute right-3 top-5 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Names */}
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

              {/* Address with Dynamic Search Simulation */}
              <div className="relative">
                <input 
                  type="text" 
                  name="address"
                  placeholder="Address"
                  value={shippingAddress.address}
                  onChange={(e) => {
                    handleShippingChange(e);
                    setShowAddressSuggestions(e.target.value.length > 2);
                  }}
                  onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                  className="w-full p-3.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400" 
                />
                <Search className="absolute right-3 top-4 text-gray-400 w-5 h-5" />
                
                {showAddressSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                    <div className="p-3 text-xs font-semibold text-gray-400 bg-gray-50 uppercase tracking-wider">Suggestions</div>
                    <button 
                      onClick={() => setShippingAddress(prev => ({...prev, address: "123 Mall Road, Mussoorie"}))}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 text-sm"
                    >
                      123 Mall Road, Mussoorie, Uttarakhand
                    </button>
                    <button 
                      onClick={() => setShippingAddress(prev => ({...prev, address: "Pacific Mall, Rajpur Road"}))}
                      className="w-full text-left p-3 hover:bg-gray-50 text-sm"
                    >
                      Pacific Mall, Rajpur Road, Dehradun
                    </button>
                  </div>
                )}
              </div>

              <input 
                type="text" 
                name="apartment"
                placeholder="Apartment, suite, etc. (optional)"
                value={shippingAddress.apartment}
                onChange={handleShippingChange}
                className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400" 
              />

              {/* City, State, Pin */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="text" 
                  name="city"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={handleShippingChange}
                  className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400" 
                />
                <div className="relative">
                  <label className="absolute left-3 top-1.5 text-[11px] text-gray-500 font-medium">State</label>
                  <select 
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleShippingChange}
                    className="w-full pt-6 pb-2 px-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
                  >
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-5 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                <input 
                  type="text" 
                  name="pinCode"
                  placeholder="PIN code"
                  value={shippingAddress.pinCode}
                  onChange={handleShippingChange}
                  className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400" 
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <input 
                  type="text" 
                  name="phone"
                  placeholder="Phone"
                  value={shippingAddress.phone}
                  onChange={handleShippingChange}
                  className="w-full p-3.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-gray-400" 
                />
                <HelpCircle className="absolute right-3 top-4 text-gray-400 w-5 h-5 cursor-pointer" />
              </div>

              {/* Save Info */}
              <label className="flex items-center space-x-3 cursor-pointer select-none py-1">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={saveInfo} 
                    onChange={() => setSaveInfo(!saveInfo)}
                    className="w-5 h-5 border-gray-300 rounded text-stone-700 focus:ring-stone-500" 
                  />
                </div>
                <span className="text-sm text-gray-700">Save this information for next time</span>
              </label>
            </div>
          </header>

          {/* Shipping Method Section */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Shipping method</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center text-gray-500 text-sm">
              Enter your shipping address to view available shipping methods.
            </div>
          </section>

          {/* Payment Section */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-1">Payment</h2>
            <p className="text-sm text-gray-500 mb-4">All transactions are secure and encrypted.</p>
            
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {/* Razorpay Option */}
              <div 
                className={`p-4 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'bg-stone-50' : 'bg-white'}`}
                onClick={() => setPaymentMethod('razorpay')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-stone-800' : 'border-gray-300'}`}>
                      {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 bg-stone-800 rounded-full" />}
                    </div>
                    <span className="text-sm font-medium">Razorpay Secure (UPI, Cards, Int'l Cards, Wallets)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-white border border-gray-200 px-1 rounded flex items-center justify-center">
                      <span className="text-[10px] font-bold text-blue-600">UPI</span>
                    </div>
                    <div className="bg-white border border-gray-200 px-1.5 rounded h-6 flex items-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-2" alt="Visa" />
                    </div>
                    <div className="bg-white border border-gray-200 px-1.5 rounded h-6 flex items-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="MC" />
                    </div>
                    <span className="text-[10px] text-gray-400">+17</span>
                  </div>
                </div>
                
                {paymentMethod === 'razorpay' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-center animate-in fade-in duration-300">
                    <div className="bg-gray-100/50 p-6 rounded-md">
                      <div className="flex justify-center mb-3">
                        <Lock className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed px-4">
                        You'll be redirected to Razorpay Secure (UPI, Cards, Int'l Cards, Wallets) to complete your purchase.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Paytm Option */}
              <div 
                className={`p-4 border-t border-gray-200 cursor-pointer transition-all ${paymentMethod === 'paytm' ? 'bg-stone-50' : 'bg-white'}`}
                onClick={() => setPaymentMethod('paytm')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'paytm' ? 'border-stone-800' : 'border-gray-300'}`}>
                      {paymentMethod === 'paytm' && <div className="w-2.5 h-2.5 bg-stone-800 rounded-full" />}
                    </div>
                    <span className="text-sm font-medium">Paytm Payment Gateway</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-white border border-gray-200 px-1.5 rounded h-6 flex items-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-2" alt="Visa" />
                    </div>
                    <div className="bg-white border border-gray-200 px-1.5 rounded h-6 flex items-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="MC" />
                    </div>
                    <div className="bg-white border border-gray-200 px-1.5 rounded h-6 flex items-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" className="h-3" alt="AMEX" />
                    </div>
                    <span className="text-[10px] text-gray-400">+3</span>
                  </div>
                </div>
              </div>

              {/* COD Option */}
              <div 
                className={`p-4 border-t border-gray-200 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'bg-stone-50' : 'bg-white'}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-stone-800' : 'border-gray-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-stone-800 rounded-full" />}
                  </div>
                  <span className="text-sm font-medium">Cash on Delivery (COD)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Billing Address Section */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Billing address</h2>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div 
                className={`p-4 flex items-center space-x-3 cursor-pointer ${sameAsShipping ? 'bg-stone-50' : 'bg-white'}`}
                onClick={() => setSameAsShipping(true)}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${sameAsShipping ? 'border-stone-800' : 'border-gray-300'}`}>
                  {sameAsShipping && <div className="w-2.5 h-2.5 bg-stone-800 rounded-full" />}
                </div>
                <span className="text-sm font-medium">Same as shipping address</span>
              </div>
              
              <div 
                className={`p-4 border-t border-gray-200 flex items-center space-x-3 cursor-pointer ${!sameAsShipping ? 'bg-stone-50' : 'bg-white'}`}
                onClick={() => setSameAsShipping(false)}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${!sameAsShipping ? 'border-stone-800' : 'border-gray-300'}`}>
                  {!sameAsShipping && <div className="w-2.5 h-2.5 bg-stone-800 rounded-full" />}
                </div>
                <span className="text-sm font-medium">Use a different billing address</span>
              </div>

              {!sameAsShipping && (
                <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="relative">
                    <label className="absolute left-3 top-1.5 text-[11px] text-gray-500 font-medium">Country/Region</label>
                    <select 
                      name="country"
                      value={billingAddress.country}
                      onChange={handleBillingChange}
                      className="w-full pt-6 pb-2 px-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
                    >
                      <option>India</option>
                      <option>United States</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-5 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      name="firstName"
                      placeholder="First name"
                      value={billingAddress.firstName}
                      onChange={handleBillingChange}
                      className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white" 
                    />
                    <input 
                      type="text" 
                      name="lastName"
                      placeholder="Last name"
                      value={billingAddress.lastName}
                      onChange={handleBillingChange}
                      className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white" 
                    />
                  </div>

                  <div className="relative">
                    <input 
                      type="text" 
                      name="address"
                      placeholder="Address"
                      value={billingAddress.address}
                      onChange={handleBillingChange}
                      className="w-full p-3.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white" 
                    />
                    <Search className="absolute right-3 top-4 text-gray-400 w-5 h-5" />
                  </div>

                  <input 
                    type="text" 
                    name="apartment"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={billingAddress.apartment}
                    onChange={handleBillingChange}
                    className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white" 
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      name="city"
                      placeholder="City"
                      value={billingAddress.city}
                      onChange={handleBillingChange}
                      className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white" 
                    />
                    <div className="relative">
                      <label className="absolute left-3 top-1.5 text-[11px] text-gray-500 font-medium">State</label>
                      <select 
                        name="state"
                        value={billingAddress.state}
                        onChange={handleBillingChange}
                        className="w-full pt-6 pb-2 px-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
                      >
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-5 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                    <input 
                      type="text" 
                      name="pinCode"
                      placeholder="PIN code"
                      value={billingAddress.pinCode}
                      onChange={handleBillingChange}
                      className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white" 
                    />
                  </div>

                  <div className="relative">
                    <input 
                      type="text" 
                      name="phone"
                      placeholder="Phone (optional)"
                      value={billingAddress.phone}
                      onChange={handleBillingChange}
                      className="w-full p-3.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white" 
                    />
                    <HelpCircle className="absolute right-3 top-4 text-gray-400 w-5 h-5 cursor-pointer" />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Pay Now Button */}
          <button className="w-full py-4 bg-[#D19D94] hover:bg-[#C28C83] text-white font-semibold rounded-md transition-colors text-lg shadow-sm">
            Pay now
          </button>

          <footer className="mt-12 pt-8 border-t border-gray-100 text-[11px] text-gray-400">
            All rights reserved - Bougie Project Pvt. Ltd.
          </footer>
        </div>

        {/* RIGHT COLUMN: Order Summary (Scrolls internally or stays visible) */}
        <div className="w-full md:w-[42%] bg-gray-50/50 p-6 md:p-12 md:h-full  md:overflow-y-auto border-l border-gray-100">
          {/* Cart Items */}
          <div className="space-y-6 mb-8">
            {INITIAL_CART.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-md p-0.5 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover rounded" 
                    />
                    <div className="absolute -top-2 -right-2 bg-stone-800 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Discount Code */}
          <div className="flex space-x-3 mb-8">
            <input 
              type="text" 
              placeholder="Discount code or gift card"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="flex-1 p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white text-sm" 
            />
            <button className="px-6 bg-gray-100 text-gray-400 font-semibold rounded-md border border-gray-200 text-sm hover:bg-gray-200 transition-colors">
              Apply
            </button>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal · 3 items</span>
              <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span>Shipping</span>
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <span className="text-gray-400">Enter shipping address</span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-bold">Total</span>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 mr-2">INR</span>
                <span className="text-2xl font-bold tracking-tight">{formatCurrency(total)}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Including {formatCurrency(taxes)} in taxes
            </p>
          </div>

          {/* Features / Trust Badges */}
          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-[11px] text-gray-500 uppercase tracking-widest font-bold">
            <div className="flex items-center space-x-2">
              <Truck className="w-3 h-3" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3 h-3" />
              <span>Quality Guaranteed</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-3 h-3" />
              <span>Safe Checkout</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;