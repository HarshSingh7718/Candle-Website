import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Check,
  Leaf,
  Truck,
  ShieldCheck,
  Flame,
  Palette,
  Sparkles,
  Info,
  Loader2,
} from "lucide-react";
import SEO from "../components/SEO";
import PageBanner from "../components/ui/PageBanner"; // Adjust path
import { useCart } from "../hooks/useCart";
import {
  useCustomizationOptions,
  useCreateCustomCandle,
} from "../hooks/useProducts";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import API from "../api";
import { trackAddToCart } from "../utils/metaPixel";

const STEPS = [
  { n: 1, label: "Vessel" },
  { n: 2, label: "Scent" },
  { n: 3, label: "Add-Ons" },
  { n: 4, label: "Message" },
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

  // Get basePrice from current step data, or fallback to cached data from other steps (e.g. on step 4)
  const getBasePrice = () => {
    if (stepData?.basePrice !== undefined) return stepData.basePrice;
    for (let i = 1; i <= 3; i++) {
      const cached = queryClient.getQueryData(["customizationOptions", i]);
      if (cached?.basePrice !== undefined) return cached.basePrice;
    }
    return 0;
  };
  const basePrice = getBasePrice();

  // 👉 2. Background Prefetching (Anticipatory Design)
  useEffect(() => {
    if (step < 3) {
      const nextStep = step + 1;
      queryClient.prefetchQuery({
        queryKey: ["customizationOptions", nextStep],
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
    if (!canGoNext())
      return toast.error("Please make a selection to continue.");
    setStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const toggleAddOn = (addOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.find((item) => item._id === addOn._id);
      if (exists) {
        return prev.filter((item) => item._id !== addOn._id);
      } else {
        return [...prev, addOn];
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
        addOnIds: selectedAddOns.map((a) => a._id),
        message: message || "",
        quantity: 1,
      };

      const response = await createMutation.mutateAsync(customPayload);

      // Add the created custom candle ID to the cart
      await addToCart({ customCandleId: response.candle._id }, 1);

      trackAddToCart({
        _id: response.candle._id,
        name: `Custom Candle: ${selectedVessel.name} + ${selectedScent.name}`,
        price: totalPrice,
        discountPrice: totalPrice
      }, 1);

      toast.success("Added your custom creation to cart!");

      // Reset Builder
      setStep(1);
      setSelectedVessel(null);
      setSelectedScent(null);
      setSelectedAddOns([]);
      setMessage("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to craft your candle"
      );
    }
  };

  const progressWidth = `${(step / STEPS.length) * 100}%`;

  return (
    <div className="min-h-screen bg-light-yellow text-slate-900 font-sans">
      <SEO
        title="Custom Candle Builder | Naisha Creations"
        description="Design your own custom candle. Choose your vessel, scent, add-ons, and add a personal message for the perfect gift."
      />
      <PageBanner title="Customized" currentPage="Customized" />
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-24">
        {/* Intro Section */}
        <div className="mb-12">
          <p className="text-coffee font-bold tracking-widest uppercase text-xs sm:text-sm mb-2">
            Custom Candle Builder
          </p>
          <h1 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            Create Your <span className="text-coffee">Signature Glow</span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed">
            Designed by you, handcrafted by us. Follow the four steps below to
            build your perfect candle using sustainably sourced soy wax.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Configuration Steps */}
          <div className="lg:col-span-7">
            <div className="bg-bg-surface border border-slate-200 rounded-[2rem] shadow-xl overflow-hidden flex flex-col h-[85vh] "> {/*lg:h-[780px]*/}
              {/* Progress Indicator */}
              <div className="sticky top-0 z-20 bg-bg-surface border-b border-slate-200 px-6 sm:px-8 pt-6">
                <div className="flex items-center justify-between pb-4">
                  {STEPS.map((s) => (
                    <div
                      key={s.n}
                      onClick={() =>
                        s.n < step || canGoNext() ? setStep(s.n) : null
                      }
                      className={`flex items-center gap-1.5 sm:gap-3 transition-all duration-300 ${step >= s.n ? "opacity-100 cursor-pointer" : "opacity-40"
                        }`}
                    >
                      <span
                        className={`size-6 sm:size-8 shrink-0 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-sm transition-all duration-300 ${step >= s.n
                          ? "bg-coffee-600 text-text-on-brand shadow-lg shadow-coffee-600/20"
                          : "bg-slate-200 text-slate-600"
                          }`}
                      >
                        {s.n}
                      </span>
                      <span
                        className={`font-bold leading-tight text-sm md:text-base  ${step === s.n ? "text-slate-900" : "text-slate-600"
                          }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 h-[2px] bg-slate-200 w-full"></div>
                <div
                  className="absolute bottom-0 left-0 h-[3px] bg-coffee-600 transition-all duration-700 ease-out z-10"
                  style={{ width: progressWidth }}
                ></div>
              </div>

              {/* Step Content Switcher */}
              <div className="flex-1 overflow-hidden relative">
                {isLoading ? (
                  <div className="p-6 sm:p-8 animate-pulse">
                    <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="aspect-square bg-slate-200 rounded-xl"></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* STEP 1: VESSEL */}
                    {step === 1 && (
                      <section className="absolute inset-0 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 shrink-0">
                          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                            <span className="p-2 bg-coffee-100 text-coffee-600 rounded-lg">
                              <Info className="size-5" />
                            </span>
                            Step 1: Choose Your Vessel
                          </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6">
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 sm:gap-4">
                            {options.map((vessel) => {
                              const isSelected = selectedVessel?._id === vessel._id;
                              return (
                                <button
                                  key={vessel._id}
                                  onClick={() => setSelectedVessel(vessel)}
                                  className={`flex flex-row items-stretch p-3 sm:p-4 rounded-xl border-2 transition-all text-left group overflow-hidden ${isSelected
                                    ? "border-coffee-600 bg-coffee-50 ring-4 ring-coffee-600/5"
                                    : "border-text-on-brand shadow-sm hover:border-coffee-200"
                                    }`}
                                >
                                  <div className="size-20 sm:size-24 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden">
                                    <img
                                      src={vessel.image?.url}
                                      alt={vessel.name}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                  </div>
                                  <div className="flex flex-col flex-1 justify-between items-start ml-4">
                                    <span
                                      className={`font-bold text-base sm:text-lg leading-tight ${isSelected
                                        ? "text-slate-900"
                                        : "text-slate-600"
                                        }`}
                                    >
                                      {vessel.name}
                                    </span>
                                    <span
                                      className={`self-end text-sm sm:text-base font-bold ${isSelected
                                        ? "text-coffee-600"
                                        : "text-slate-500"
                                        }`}
                                    >
                                      +₹{Number(vessel.price).toFixed(2)}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    )}

                    {/* STEP 2: SCENT */}
                    {step === 2 && (
                      <section className="absolute inset-0 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 shrink-0">
                          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                            <span className="p-2 bg-coffee-100 text-coffee-600 rounded-lg">
                              <Flame className="size-5" />
                            </span>
                            Step 2: Scent Profile
                          </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6">
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 sm:gap-5">
                            {options.map((scent) => {
                              const isSelected = selectedScent?._id === scent._id;
                              return (
                                <button
                                  key={scent._id}
                                  onClick={() => setSelectedScent(scent)}
                                  className={`flex flex-col p-3 sm:p-4 rounded-xl border-2 transition-all text-left group overflow-hidden h-full ${isSelected
                                    ? "border-coffee-600 bg-coffee-50 ring-4 ring-coffee-600/5"
                                    : "border-text-on-brand shadow-sm hover:border-coffee-200"
                                    }`}
                                >
                                  <div className="aspect-square w-full rounded-lg mb-4 overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                    <img
                                      src={scent.image?.url}
                                      alt={scent.name}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                  </div>
                                  <div className="flex flex-col flex-1 justify-between w-full gap-2">
                                    <span
                                      className={`font-bold text-sm sm:text-base leading-tight ${isSelected
                                        ? "text-slate-900"
                                        : "text-slate-600"
                                        }`}
                                    >
                                      {scent.name}
                                    </span>
                                    <span
                                      className={`text-xs sm:text-sm font-bold ${isSelected
                                        ? "text-coffee-600"
                                        : "text-slate-500"
                                        }`}
                                    >
                                      +₹{Number(scent.price).toFixed(2)}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    )}

                    {/* STEP 3: ADD-ONS */}
                    {step === 3 && (
                      <section className="absolute inset-0 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 shrink-0">
                          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                            <span className="p-2 bg-coffee-100 text-coffee-600 rounded-lg">
                              <Palette className="size-5" />
                            </span>
                            Step 3: Choose Add-ons
                          </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6">
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 sm:gap-5">
                            {options.map((addOn) => {
                              const isSelected = selectedAddOns.some(
                                (t) => t._id === addOn._id
                              );
                              return (
                                <button
                                  key={addOn._id}
                                  onClick={() => toggleAddOn(addOn)}
                                  className={`flex flex-col p-3 sm:p-4 rounded-xl border-2 transition-all text-left group overflow-hidden relative h-full ${isSelected
                                    ? "border-coffee-600 bg-coffee-50 ring-4 ring-coffee-600/5"
                                    : "border-text-on-brand shadow-sm hover:border-coffee-200"
                                    }`}
                                >
                                  <div className="aspect-square w-full rounded-lg mb-4 overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                    <img
                                      src={addOn.image?.url}
                                      alt={addOn.name}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                  </div>
                                  <div className="flex flex-col flex-1 justify-between w-full gap-2">
                                    <span
                                      className={`block font-bold text-sm sm:text-base leading-tight ${isSelected
                                        ? "text-slate-900"
                                        : "text-slate-600"
                                        }`}
                                    >
                                      {addOn.name}
                                    </span>
                                    <span
                                      className={`text-xs sm:text-sm font-bold ${isSelected
                                        ? "text-coffee-600"
                                        : "text-slate-500"
                                        }`}
                                    >
                                      +₹{Number(addOn.price).toFixed(2)}
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <div className="absolute top-4 right-4 bg-coffee-600 text-text-on-brand rounded-full p-1 shadow-lg ring-2 ring-white z-10">
                                      <Check className="size-4" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    )}

                    {/* STEP 4: MESSAGE / SPECIAL INSTRUCTIONS */}
                    {step === 4 && (
                      <section className="absolute inset-0 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 shrink-0">
                          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                            <span className="p-2 bg-coffee-100 text-coffee-600 rounded-lg">
                              <Sparkles className="size-5" />
                            </span>
                            Step 4: Special Instructions
                          </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6">
                          <div className="bg-bg-surface p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <label className="block text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                              Any special notes?
                            </label>
                            <textarea
                              maxLength={100}
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="w-full text-base sm:text-lg p-4 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-coffee-500 focus:outline-none transition-all shadow-inner resize-none min-h-[120px]"
                              placeholder="E.g., specific placement for add-ons, or gift instructions..."
                            />
                            <p className="mt-4 text-slate-400 text-xs italic">
                              * Max 100 characters.
                            </p>
                          </div>
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>

              {/* Builder Footer Navigation */}
              <div className="border-t border-slate-200 bg-bg-surface px-6 py-3 flex justify-between items-center shrink-0">
                <button
                  onClick={prevStep}
                  disabled={step === 1}
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-all"
                >
                  Back
                </button>

                {step < STEPS.length ? (
                  <button
                    onClick={nextStep}
                    className="bg-coffee-600 text-text-on-brand px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-coffee-700 shadow-lg shadow-coffee-600/20 transition-all"
                  >
                    Continue
                    <ChevronRight className="size-5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAddToCart}
                      disabled={
                        createMutation.isPending ||
                        !selectedVessel ||
                        !selectedScent
                      }
                      className="hidden lg:block bg-primary text-text-on-brand px-8 py-3 rounded-xl font-bold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-slate-800 transition-all"
                    >
                      {createMutation.isPending
                        ? "Crafting..."
                        : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => {
                        document.getElementById('order-summary')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="lg:hidden bg-coffee-600 text-text-on-brand px-8 py-3 rounded-xl font-bold hover:bg-coffee-700 shadow-lg shadow-coffee-600/20 transition-all"
                    >
                      Review
                    </button>
                  </>
                )}
              </div>


            </div>
          </div>

          {/* Right: Summary Sticky Card */}
          <div className="lg:col-span-5 scroll-mt-28" id="order-summary">
            <div className="lg:sticky lg:top-12 space-y-8">
              <div className="bg-bg-surface rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-text-on-brand">
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* Base Crafting Charge */}
                    <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                      <span>Base Crafting Charge</span>
                      <span className="text-slate-900 font-bold">
                        ₹{basePrice.toFixed(2)}
                      </span>
                    </div>

                    {selectedVessel && (
                      <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                        <span>
                          Vessel:{" "}
                          <span className="text-slate-900 font-bold">
                            {selectedVessel.name}
                          </span>
                        </span>
                        <span className="text-coffee-600 font-bold">
                          +₹{selectedVessel.price.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {selectedScent && (
                      <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                        <span>
                          Scent:{" "}
                          <span className="text-slate-900 font-bold">
                            {selectedScent.name}
                          </span>
                        </span>
                        <span className="text-coffee-600 font-bold">
                          +₹{scentPrice.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {selectedAddOns.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider border-t border-slate-100 pt-3">
                          Add-ons:
                        </p>
                        {selectedAddOns.map((t) => (
                          <div
                            key={t._id}
                            className="flex justify-between items-center text-slate-500 text-sm font-medium pl-2"
                          >
                            <span className="text-slate-900 font-bold">
                              • {t.name}
                            </span>
                            <span className="text-coffee-600 font-bold">
                              +₹{t.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {message && (
                      <div className="border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
                        <span className="font-bold uppercase tracking-wider">
                          Instructions:
                        </span>
                        <p className="text-slate-900 italic mt-1 bg-slate-50 p-2 rounded">
                          "{message}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-slate-100"></div>

                  <div>
                    <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                      Total Amount
                    </span>
                    <span className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter">
                      ₹{totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {step === STEPS.length && (
                    <button
                      onClick={handleAddToCart}
                      disabled={
                        createMutation.isPending ||
                        !selectedVessel ||
                        !selectedScent
                      }
                      className="w-full bg-primary text-text-on-brand py-4 sm:py-5 font-bold uppercase tracking-widest transition-all hover:bg-slate-800 shadow-lg text-sm disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {createMutation.isPending ? "Crafting..." : "Add to Cart"}
                    </button>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex justify-around items-center bg-coffee/10 py-4 sm:py-6 rounded-2xl border border-coffee/20">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-bg-surface p-2 rounded-full shadow-sm">
                    <Leaf className="text-coffee-600 size-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-coffee">
                    100% Soy
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-bg-surface p-2 rounded-full shadow-sm">
                    <Truck className="text-coffee-600 size-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-coffee">
                    Fast Ship
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-bg-surface p-2 rounded-full shadow-sm">
                    <ShieldCheck className="text-coffee-600 size-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-coffee">
                    Quality
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
