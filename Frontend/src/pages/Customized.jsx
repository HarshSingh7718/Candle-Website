import React, { useState, useEffect } from 'react';
import {
  ChevronRight, Check, Leaf, Truck, ShieldCheck,
  Flame, Palette, Sparkles, Info, Loader2
} from 'lucide-react';
import PageBanner from '../components/ui/PageBanner'; // Adjust path
import { useCart } from '../hooks/useCart';
import { useCustomizationOptions, useCreateCustomCandle } from '../hooks/useProducts';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import API from '../api';

const STEPS = [
  { n: 1, label: "Vessel" },
  { n: 2, label: "Scent" },
  { n: 3, label: "Add-Ons" },
  { n: 4, label: "Message" }
];

export default function Customized() {
  const { addToCart } = useCart();
  const queryClient = useQueryClient();

  // 👉 1. API Hooks (Gets both basePrice and options from one route)
  const [step, setStep] = useState(1);
  const { data: stepData, isLoading } = useCustomizationOptions(step);
  const createMutation = useCreateCustomCandle();

  // Safely extract data
  const options = stepData?.options || [];
  const basePrice = stepData?.basePrice || 0;

  // 👉 2. Background Prefetching (Anticipatory Design)
  useEffect(() => {
    if (step < 3) {
      const nextStep = step + 1;
      queryClient.prefetchQuery({
        queryKey: ['customizationOptions', nextStep],
        queryFn: async () => {
          const { data } = await API.get(`/customization-options/${nextStep}`);
          return data; // Fixed: Return the whole object so cache matches exactly!
        },
        staleTime: 1000 * 60 * 30, // 30 mins
      });
    }
  }, [step, queryClient]);

  // 👉 3. Selections State
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [selectedScent, setSelectedScent] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [message, setMessage] = useState("");

  // 👉 4. Dynamic Pricing Calculations
  const vesselPrice = selectedVessel?.price || 0;
  const scentPrice = selectedScent?.price || 0;
  const addOnsPrice = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = basePrice + vesselPrice + scentPrice + addOnsPrice;

  // 👉 5. Navigation & Logic
  const canGoNext = () => {
    if (step === 1 && !selectedVessel) return false;
    if (step === 2 && !selectedScent) return false;
    return true;
  };

  const nextStep = () => {
    if (!canGoNext()) return toast.error("Please make a selection to continue.");
    setStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const toggleAddOn = (addon) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(item => item._id === addon._id);
      if (exists) {
        return prev.filter(item => item._id !== addon._id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAddToCart = async () => {
    if (!selectedVessel || !selectedScent) {
      return toast.error("Missing vessel or scent selection!");
    }

    try {
      const customPayload = {
        vesselId: selectedVessel._id,
        scentId: selectedScent._id,
        addOnIds: selectedAddOns.map(a => a._id),
        message: message || "",
        quantity: 1
      };

      const response = await createMutation.mutateAsync(customPayload);

      // Add the created custom candle ID to the cart
      await addToCart({ customCandleId: response.candle._id }, 1);

      toast.success("Added your custom creation to cart!");

      // Reset Builder
      setStep(1);
      setSelectedVessel(null);
      setSelectedScent(null);
      setSelectedAddOns([]);
      setMessage("");

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to craft your candle");
    }
  };

  const progressWidth = `${(step / STEPS.length) * 100}%`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <PageBanner title="Customized" currentPage="Customized" />
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-24">

        {/* Intro Section */}
        <div className="mb-12">
          <p className="text-orange-600 font-bold tracking-widest uppercase text-xs sm:text-sm mb-2">Custom Candle Builder</p>
          <h1 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            Create Your <span className="text-orange-600">Signature Glow</span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed">
            Designed by you, handcrafted by us. Follow the four steps below to build your perfect candle using sustainably sourced soy wax.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Configuration Steps */}
          <div className="lg:col-span-7 space-y-8 sm:space-y-12">

            {/* Progress Indicator */}
            <div className="relative border-b border-slate-200">
              <div className="flex items-center justify-between pb-4">
                {STEPS.map((s) => (
                  <div
                    key={s.n}
                    onClick={() => (s.n < step || canGoNext()) ? setStep(s.n) : null}
                    className={`flex items-center gap-1.5 sm:gap-3 transition-all duration-300 ${step >= s.n ? 'opacity-100 cursor-pointer' : 'opacity-40'}`}
                  >
                    <span className={`size-6 sm:size-8 shrink-0 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-sm transition-all duration-300 ${step >= s.n ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-200 text-slate-600'}`}>
                      {s.n}
                    </span>
                    <span className={`font-bold leading-tight text-sm md:text-base hidden sm:block ${step === s.n ? 'text-slate-900' : 'text-slate-600'}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 h-[2px] bg-slate-200 w-full"></div>
              <div className="absolute bottom-0 left-0 h-[3px] bg-orange-600 transition-all duration-700 ease-out z-10" style={{ width: progressWidth }}></div>
            </div>

            {/* Step Content Switcher */}
            <div className="min-h-[400px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Loader2 className="size-8 animate-spin mb-4 text-orange-600" />
                  <p>Loading builder...</p>
                </div>
              ) : (
                <>
                  {/* STEP 1: VESSEL */}
                  {step === 1 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                          <span className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Info className="size-5" /></span>
                          Step 1: Choose Your Vessel
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {options.map((vessel) => (
                          <div
                            key={vessel._id}
                            onClick={() => setSelectedVessel(vessel)}
                            className={`group relative bg-white p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${selectedVessel?._id === vessel._id
                              ? 'border-orange-600 ring-4 ring-orange-600/10 shadow-xl shadow-orange-600/5'
                              : 'border-white hover:border-orange-200 hover:ring-4 hover:ring-orange-100/50 shadow-sm'
                              }`}
                          >
                            <div className="aspect-square rounded-xl bg-slate-100 mb-4 overflow-hidden">
                              <img src={vessel.image?.url} alt={vessel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-base sm:text-lg text-slate-900">{vessel.name}</h4>
                              </div>
                              <span className={`font-bold text-sm sm:text-base transition-colors ${selectedVessel?._id === vessel._id ? 'text-orange-600' : 'text-slate-500'}`}>
                                +₹{Number(vessel.price).toFixed(2)}
                              </span>
                            </div>
                            <div className={`absolute top-6 right-6 bg-orange-600 text-white rounded-full p-1 shadow-lg ring-2 ring-white transition-all duration-300 ${selectedVessel?._id === vessel._id ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                              <Check className="size-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* STEP 2: SCENT */}
                  {step === 2 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                          <span className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Flame className="size-5" /></span>
                          Step 2: Scent Profile
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {options.map((scent) => {
                          const isSelected = selectedScent?._id === scent._id;
                          return (
                            <button
                              key={scent._id}
                              onClick={() => setSelectedScent(scent)}
                              className={`flex flex-col p-4 rounded-xl border-2 transition-all text-left group overflow-hidden ${isSelected ? 'border-orange-600 bg-orange-50 ring-4 ring-orange-600/5' : 'border-white shadow-sm hover:border-orange-200'
                                }`}
                            >
                              <div className="aspect-[16/10] w-full rounded-lg mb-4 overflow-hidden bg-slate-100">
                                <img src={scent.image?.url} alt={scent.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              </div>
                              <div className="flex items-center justify-between w-full">
                                <span className={`font-bold text-sm sm:text-base ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{scent.name}</span>
                                <span className={`text-xs font-bold ${isSelected ? 'text-orange-600' : 'text-slate-500'}`}>
                                  +₹{Number(scent.price).toFixed(2)}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* STEP 3: ADD-ONS */}
                  {step === 3 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                          <span className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Palette className="size-5" /></span>
                          Step 3: Choose Add-ons
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {options.map((addon) => {
                          const isSelected = selectedAddOns.some(t => t._id === addon._id);
                          return (
                            <button
                              key={addon._id}
                              onClick={() => toggleAddOn(addon)}
                              className={`flex flex-col p-4 rounded-xl border-2 transition-all text-left group overflow-hidden relative ${isSelected ? 'border-orange-600 bg-orange-50 ring-4 ring-orange-600/5' : 'border-white shadow-sm hover:border-orange-200'
                                }`}
                            >
                              <div className="aspect-[16/10] w-full rounded-lg mb-4 overflow-hidden bg-slate-100">
                                <img src={addon.image?.url} alt={addon.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              </div>
                              <div className="flex justify-between items-center w-full">
                                <span className={`block font-bold ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{addon.name}</span>
                                <span className={`text-[10px] sm:text-xs font-bold ${isSelected ? 'text-orange-600' : 'text-slate-500'}`}>
                                  +₹{Number(addon.price).toFixed(2)}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="absolute top-6 right-6 bg-orange-600 text-white rounded-full p-1 shadow-lg ring-2 ring-white">
                                  <Check className="size-4" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* STEP 4: MESSAGE / SPECIAL INSTRUCTIONS */}
                  {step === 4 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                          <span className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Sparkles className="size-5" /></span>
                          Step 4: Special Instructions
                        </h3>
                      </div>
                      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <label className="block text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Any special notes?</label>
                        <textarea
                          maxLength={100}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full text-base sm:text-lg p-4 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 focus:outline-none transition-all shadow-inner resize-none min-h-[120px]"
                          placeholder="E.g., specific placement for add-ons, or gift instructions..."
                        />
                        <p className="mt-4 text-slate-400 text-xs italic">* Max 100 characters.</p>
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-200">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-900 disabled:opacity-0 transition-all cursor-pointer"
              >
                Back
              </button>
              {step < STEPS.length ? (
                <button
                  onClick={nextStep}
                  className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 hover:bg-orange-700 shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  Continue <ChevronRight className="size-5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Right: Summary Sticky Card */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-12 space-y-8">
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-white">
                <div className="space-y-6">
                  <div className="space-y-4">

                    {/* Base Crafting Charge */}
                    <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                      <span>Base Crafting Charge</span>
                      <span className="text-slate-900 font-bold">₹{basePrice.toFixed(2)}</span>
                    </div>

                    {selectedVessel && (
                      <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                        <span>Vessel: <span className="text-slate-900 font-bold">{selectedVessel.name}</span></span>
                        <span className="text-orange-600 font-bold">
                          +₹{selectedVessel.price.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {selectedScent && (
                      <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                        <span>Scent: <span className="text-slate-900 font-bold">{selectedScent.name}</span></span>
                        <span className="text-orange-600 font-bold">
                          +₹{scentPrice.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {selectedAddOns.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider border-t border-slate-100 pt-3">Add-ons:</p>
                        {selectedAddOns.map(t => (
                          <div key={t._id} className="flex justify-between items-center text-slate-500 text-sm font-medium pl-2">
                            <span className="text-slate-900 font-bold">• {t.name}</span>
                            <span className="text-orange-600 font-bold">
                              +₹{t.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {message && (
                      <div className="border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
                        <span className="font-bold uppercase tracking-wider">Instructions:</span>
                        <p className="text-slate-900 italic mt-1 bg-slate-50 p-2 rounded">"{message}"</p>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-slate-100"></div>

                  <div>
                    <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Total Amount</span>
                    <span className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter">₹{totalPrice.toFixed(2)}</span>
                  </div>

                  {step === STEPS.length && (
                    <button
                      onClick={handleAddToCart}
                      disabled={createMutation.isPending || !selectedVessel || !selectedScent}
                      className="w-full bg-black text-white py-4 sm:py-5 font-bold uppercase tracking-widest transition-all hover:bg-slate-800 shadow-lg text-sm disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {createMutation.isPending ? "Crafting..." : "Add to Cart"}
                    </button>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex justify-around items-center bg-slate-100/50 py-4 sm:py-6 rounded-2xl border border-slate-200/50">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-white p-2 rounded-full shadow-sm"><Leaf className="text-orange-600 size-4" /></div>
                  <span className="text-[10px] font-black uppercase text-slate-500">100% Soy</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-white p-2 rounded-full shadow-sm"><Truck className="text-orange-600 size-4" /></div>
                  <span className="text-[10px] font-black uppercase text-slate-500">Fast Ship</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-white p-2 rounded-full shadow-sm"><ShieldCheck className="text-orange-600 size-4" /></div>
                  <span className="text-[10px] font-black uppercase text-slate-500">Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}