import React, { useState } from 'react';
import { 
  ChevronRight, 
  Check, 
  ShoppingBasket, 
  Leaf, 
  Truck, 
  ShieldCheck, 
  Flame, 
  Wind, 
  Flower2, 
  Coffee,
  Sparkles,
  Info,
  Gem,
  Palette,
  X
} from 'lucide-react';
import PageBanner from '../components/ui/PageBanner';
import { useCart } from '../hooks/useCart';
import { useCustomCandleBuilder } from '../hooks/useProducts'; // Or wherever you put it
import toast from 'react-hot-toast';

// --- Mock Data ---
const VESSELS = [
  {
    id: 'amber-glass',
    name: 'Amber Glass Jar',
    description: '12oz | 60hr burn time',
    price: 0,
    image: 'https://images.unsplash.com/photo-1603006905393-d25080036329?auto=format&fit=crop&q=80&w=400',
    previewImage: 'https://images.unsplash.com/photo-1602850318393-73012776fb61?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'matte-black',
    name: 'Midnight Matte Black',
    description: '10oz | 50hr burn time',
    price: 5,
    image: 'https://images.unsplash.com/photo-1605651202774-94e630028b50?auto=format&fit=crop&q=80&w=400',
    previewImage: 'https://images.unsplash.com/photo-1605651202774-94e630028b50?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'textured-ceramic',
    name: 'Textured Ceramic',
    description: '14oz | 73hr burn time',
    price: 12,
    image: 'https://images.unsplash.com/photo-1594913217912-3081e6425026?auto=format&fit=crop&q=80&w=400',
    previewImage: 'https://images.unsplash.com/photo-1594913217912-3081e6425026?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'clear-minimalist',
    name: 'Clear Minimalist',
    description: '8oz | 40hr burn time',
    price: 2,
    image: 'https://images.unsplash.com/photo-1608139396038-0035419fd9bc?auto=format&fit=crop&q=80&w=400',
    previewImage: 'https://images.unsplash.com/photo-1608139396038-0035419fd9bc?auto=format&fit=crop&q=80&w=600'
  }
];

const SCENTS = [
  { 
    id: 'woody', 
    name: 'Woody & Earthy', 
    icon: <Flame className="size-4" />,
    image: 'https://images.unsplash.com/photo-1541944743827-e04bb645f946?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 'floral', 
    name: 'Floral & Sweet', 
    icon: <Flower2 className="size-4" />,
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 'fresh', 
    name: 'Fresh & Citrus', 
    icon: <Wind className="size-4" />,
    image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 'spicy', 
    name: 'Spicy & Warm', 
    icon: <Coffee className="size-4" />,
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=400'
  },
];

const TOPPINGS = [
  { 
    id: 'none', 
    name: 'No Toppings', 
    price: 0, 
    icon: <Info className="size-4" />,
    image: 'https://images.unsplash.com/photo-1602873145311-df71d583019f?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 'flowers', 
    name: 'Dried Florals', 
    price: 3.50, 
    icon: <Flower2 className="size-4" />,
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 'gold', 
    name: '24k Gold Flakes', 
    price: 6.00, 
    icon: <Sparkles className="size-4" />,
    image: 'https://images.unsplash.com/photo-1590001158193-42cc19af04d4?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 'crystals', 
    name: 'Amethyst Crystals', 
    price: 8.00, 
    icon: <Gem className="size-4" />,
    image: 'https://images.unsplash.com/photo-1567883110297-cd2fab01d889?auto=format&fit=crop&q=80&w=400'
  },
];

const STEPS = [
  { n: 1, label: ' Vessel' },
  { n: 2, label: ' Scent' },
  { n: 3, label: 'Toppings' },
  { n: 4, label: ' Label' }
];

export default function Customized() {
  const { addToCart } = useCart();
  const createMutation = useCustomCandleBuilder();
  const [step, setStep] = useState(1);
  const [selectedVessel, setSelectedVessel] = useState(VESSELS[0]);
  const [selectedScent, setSelectedScent] = useState(SCENTS[0]);
  const [selectedToppings, setSelectedToppings] = useState([TOPPINGS[0]]);
  const [labelText, setLabelText] = useState("");

  const basePrice = 24.00;
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const totalPrice = basePrice + selectedVessel.price + toppingsPrice;

  const nextStep = () => setStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const toggleTopping = (topping) => {
    if (topping.id === 'none') {
      setSelectedToppings([topping]);
      return;
    }

    setSelectedToppings(prev => {
      const isAlreadySelected = prev.find(t => t.id === topping.id);
      let next;
      
      if (isAlreadySelected) {
        next = prev.filter(t => t.id !== topping.id);
      } else {
        // Remove "none" if we are adding a real topping
        const filtered = prev.filter(t => t.id !== 'none');
        next = [...filtered, topping];
      }

      // Default back to "none" if everything was deselected
      return next.length === 0 ? [TOPPINGS[0]] : next;
    });
  };

  const handleAddToCart = async () => {
    try {
      // Create the payload matching your backend schema
      const customPayload = {
        vessel: selectedVessel.name, // Or send ID if backend expects it
        scent: selectedScent.name,
        toppings: selectedToppings.map(t => t.name),
        label: labelText || 'YOUR TEXT HERE',
        price: totalPrice
      };

      // 1. Save it to the database
      const response = await createMutation.mutateAsync(customPayload);

      // Assuming your backend returns the new candle in response.customCandle
      const newCandleId = response.customCandle._id;

      // 2. Add it to the cart using the ID!
      // Remember our useCart hook expects { customCandleId: ... }
      await addToCart({ customCandleId: newCandleId }, 1);

      toast.success("Added your custom creation to cart!");

      // Optional: Reset the form or redirect to cart
      // setStep(1); 

    } catch (error) {
      console.error("Failed to add custom candle:", error);
    }
  };

  const progressWidth = `${(step / STEPS.length) * 100}%`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
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

        {/* Wizard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Configuration Steps */}
          <div className="lg:col-span-7 space-y-8 sm:space-y-12">
            
            {/* Progress Indicator Container */}
            <div className="relative border-b border-slate-200">
              <div className="flex items-center justify-between pb-4">
                {STEPS.map((s) => (
                  <div 
                    key={s.n}
                    onClick={() => setStep(s.n)}
                    className={`flex items-center gap-1.5 sm:gap-3 transition-all duration-300 cursor-pointer ${
                      step >= s.n ? 'opacity-100' : 'opacity-40 hover:opacity-60'
                    }`}
                  >
                    <span className={`size-6 sm:size-8 shrink-0 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-sm transition-all duration-300 ${
                      step >= s.n ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {s.n}
                    </span>
                    <span className={`font-bold  leading-tight text-sm md:text-base ${step === s.n ? 'text-slate-900' : 'text-slate-600'} line-clamp-2 max-w-[60px] sm:max-w-none`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Dynamic Progress Line */}
              <div className="absolute bottom-0 left-0 h-[2px] bg-slate-200 w-full"></div>
              <div 
                className="absolute bottom-0 left-0 h-[3px] bg-orange-600 transition-all duration-700 ease-out z-10"
                style={{ width: progressWidth }}
              ></div>
            </div>

            {/* Step Content Switcher */}
            <div className="min-h-[400px]">
              {step === 1 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                      <span className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <Info className="size-5" />
                      </span>
                      Step 1: Choose Your Vessel
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {VESSELS.map((vessel) => (
                      <div 
                        key={vessel.id}
                        onClick={() => setSelectedVessel(vessel)}
                        className={`group relative bg-white p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                          selectedVessel.id === vessel.id 
                            ? 'border-orange-600 ring-4 ring-orange-600/10 shadow-xl shadow-orange-600/5' 
                            : 'border-white hover:border-orange-200 hover:ring-4 hover:ring-orange-100/50'
                        }`}
                      >
                        <div className="aspect-square rounded-xl bg-slate-100 mb-4 overflow-hidden">
                          <img 
                            src={vessel.image} 
                            alt={vessel.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-base sm:text-lg text-slate-900">{vessel.name}</h4>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">{vessel.description}</p>
                          </div>
                          <span className={`font-bold text-sm sm:text-base transition-colors ${
                            selectedVessel.id === vessel.id || vessel.price > 0 ? 'text-orange-600' : 'text-slate-400'
                          }`}>
                            {vessel.price === 0 ? 'Included' : `+$${vessel.price.toFixed(2)}`}
                          </span>
                        </div>
                        
                        <div className={`absolute top-6 right-6 bg-orange-600 text-white rounded-full p-1 shadow-lg ring-2 ring-white transition-all duration-300 ${
                          selectedVessel.id === vessel.id ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                        }`}>
                          <Check className="size-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                      <span className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <Flame className="size-5" />
                      </span>
                      Step 2: Scent Profile
                    </h3>
                  </div>
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <p className="text-sm sm:text-base text-slate-600 font-medium">Select a primary fragrance profile for your candle:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {SCENTS.map((scent) => {
                        const isSelected = selectedScent.id === scent.id;
                        return (
                          <button 
                            key={scent.id} 
                            onClick={() => setSelectedScent(scent)}
                            className={`flex flex-col p-4 rounded-xl border-2 transition-all text-left group overflow-hidden ${
                              isSelected 
                                ? 'border-orange-600 bg-orange-50 ring-4 ring-orange-600/5' 
                                : 'border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/30'
                            }`}
                          >
                            <div className="aspect-[16/10] w-full rounded-lg mb-4 overflow-hidden bg-slate-100">
                              <img 
                                src={scent.image} 
                                alt={scent.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`p-3 rounded-lg transition-colors ${
                                isSelected ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600 group-hover:bg-orange-100'
                              }`}>
                                {scent.icon}
                              </span>
                              <span className={`font-bold text-sm sm:text-base ${isSelected ? 'text-slate-900' : 'text-slate-600 transition-colors'}`}>
                                {scent.name}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                      <span className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <Palette className="size-5" />
                      </span>
                      Step 3: Choose Toppings (Multiple)
                    </h3>
                  </div>
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <p className="text-sm sm:text-base text-slate-600 font-medium">Elevate your candle with hand-placed decorative elements. Mix and match as you like!</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {TOPPINGS.map((topping) => {
                        const isSelected = selectedToppings.some(t => t.id === topping.id);
                        return (
                          <button 
                            key={topping.id} 
                            onClick={() => toggleTopping(topping)}
                            className={`flex flex-col p-4 rounded-xl border-2 transition-all text-left group overflow-hidden relative ${
                              isSelected 
                                ? 'border-orange-600 bg-orange-50 ring-4 ring-orange-600/5 shadow-inner' 
                                : 'border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/30'
                            }`}
                          >
                            <div className="aspect-[16/10] w-full rounded-lg mb-4 overflow-hidden bg-slate-100">
                              <img 
                                src={topping.image} 
                                alt={topping.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`p-3 rounded-lg transition-colors ${
                                isSelected ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600 group-hover:bg-orange-100'
                              }`}>
                                {topping.icon}
                              </span>
                              <div className="flex-1 text-sm sm:text-base">
                                <span className={`block font-bold ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                  {topping.name}
                                </span>
                                <span className={`text-[10px] sm:text-xs font-bold ${isSelected ? 'text-orange-600' : 'text-slate-400'}`}>
                                  {topping.price === 0 ? 'Included' : `+$${topping.price.toFixed(2)}`}
                                </span>
                              </div>
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
                  </div>
                </section>
              )}

              {step === 4 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                      <span className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <Sparkles className="size-5" />
                      </span>
                      Step 4: Personalize Label
                    </h3>
                  </div>
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Your Custom Text</label>
                    <input 
                      type="text" 
                      maxLength={20}
                      value={labelText}
                      onChange={(e) => setLabelText(e.target.value.toUpperCase())}
                      className="w-full text-lg sm:text-2xl font-black p-4 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 focus:outline-none focus:bg-white transition-all shadow-inner"
                      placeholder="ENTER MESSAGE..."
                    />
                    <p className="mt-4 text-slate-400 text-[10px] sm:text-sm italic">* Max 20 characters for optimal printing.</p>
                  </div>
                </section>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-200">
              <button 
                onClick={prevStep}
                disabled={step === 1}
                className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 hover:bg-slate-100 disabled:opacity-0 transition-all text-slate-500 hover:text-slate-900"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                className="bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base flex items-center gap-3 hover:bg-orange-700 shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
              >
                {step === STEPS.length ? 'Review' : 'Continue'}
                <ChevronRight className="size-4 sm:size-5" />
              </button>
            </div>
          </div>

          {/* Right: Summary Sticky Card */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-12 space-y-8">
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-slate-200 border border-white">
                
                {/* Price Summary */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-slate-500 text-xs sm:text-sm font-medium">
                      <span>Base Candle (8oz)</span>
                      <span className="text-slate-900">$24.00</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 text-xs sm:text-sm font-medium">
                      <span>{selectedVessel.name} Upgrade</span>
                      <span className={selectedVessel.price > 0 ? 'text-orange-600' : 'text-slate-900'}>
                        {selectedVessel.price > 0 ? `+$${selectedVessel.price.toFixed(2)}` : 'FREE'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 text-xs sm:text-sm font-medium">
                      <span>Fragrance: <span className="text-slate-900 font-bold">{selectedScent.name}</span></span>
                      <span className="text-orange-600">FREE</span>
                    </div>
                    
                    {/* Multi-Toppings Display */}
                    <div className="space-y-2">
                      <p className="text-slate-500 text-xs sm:text-sm font-medium border-t border-slate-50 pt-2">Toppings:</p>
                      {selectedToppings.map(t => (
                        <div key={t.id} className="flex justify-between items-center text-slate-500 text-xs sm:text-sm font-medium pl-2">
                          <span className="flex items-center gap-2">
                            <span className="size-1 bg-orange-400 rounded-full"></span>
                            <span className="text-slate-900 font-bold">{t.name}</span>
                          </span>
                          <span className={t.price > 0 ? 'text-orange-600' : 'text-slate-900'}>
                            {t.price > 0 ? `+$${t.price.toFixed(2)}` : 'FREE'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="h-px bg-slate-100"></div>
                  
                  <div>
                    <span className="block text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2">Total Amount</span>
                    <span className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter">${totalPrice.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={createMutation.isPending}
                    className="w-full bg-black text-white py-4 sm:py-5 font-bold uppercase tracking-[0.2em] transition-all hover:bg-slate-800 active:scale-[0.98] shadow-lg text-xs sm:text-sm disabled:bg-gray-400 disabled:scale-100"
                  >
                    {createMutation.isPending ? "Crafting..." : "Add to Cart"}
                  </button>
                  
                  <p className="text-center text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold italic">
                    Ships within 3-5 business days
                  </p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex justify-around items-center px-2 sm:px-4 bg-slate-100/50 py-4 sm:py-6 rounded-2xl border border-slate-200/50">
                <div className="flex flex-col items-center gap-1 sm:gap-2">
                  <div className="bg-white p-2 sm:p-3 rounded-full shadow-sm">
                    <Leaf className="text-orange-600 size-4 sm:size-5" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">100% Soy</span>
                </div>
                <div className="flex flex-col items-center gap-1 sm:gap-2">
                   <div className="bg-white p-2 sm:p-3 rounded-full shadow-sm">
                    <Truck className="text-orange-600 size-4 sm:size-5" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Fast Ship</span>
                </div>
                <div className="flex flex-col items-center gap-1 sm:gap-2">
                  <div className="bg-white p-2 sm:p-3 rounded-full shadow-sm">
                    <ShieldCheck className="text-orange-600 size-4 sm:size-5" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Step Teaser */}
        <section className="mt-16 sm:mt-24 bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-16 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 size-60 sm:size-80 bg-orange-600/20 blur-[80px] sm:blur-[100px] rounded-full group-hover:bg-orange-600/30 transition-colors"></div>
          <div className="max-w-3xl relative z-10">
            <h4 className="text-orange-500 font-black tracking-[0.3em] uppercase text-[10px] sm:text-xs mb-4 sm:mb-6">Coming up next</h4>
            <h3 className="text-2xl sm:text-5xl font-black mb-4 sm:mb-6 leading-tight tracking-tight">Discover Your <br className="hidden sm:block"/>Signature Scent</h3>
            <p className="text-slate-400 text-sm sm:text-lg leading-relaxed mb-6 sm:mb-10 max-w-xl font-medium">
              In Step 2, you'll be able to mix and match up to 3 premium fragrance oils sourced from the finest essential oils.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-4 hidden sm:flex">
              {['Woody & Earthy', 'Floral & Sweet', 'Fresh & Citrus', 'Spicy & Warm'].map((tag) => (
                <span key={tag} className="px-4 sm:px-6 py-2 sm:py-3 bg-white/5 hover:bg-white/10 rounded-full text-[10px] sm:text-sm font-bold border border-white/10 transition-colors cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}