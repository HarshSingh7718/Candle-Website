import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useOptions } from '../context/OptionContext';

const AddOption = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tabId') ? Number(searchParams.get('tabId')) : 1;

  const [tabId, setTabId] = useState(initialTab);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { addOption } = useOptions();
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !imagePreview) return; // Basic validation
    
    addOption({ 
      tabId: Number(tabId), 
      name, 
      desc, 
      price: Number(price) || 0, 
      stock: Number(stock) || 0,
      img: imagePreview 
    });
    navigate('/options');
  };

  const steps = [
    { id: 1, label: 'Scent' },
    { id: 2, label: 'Vessel' },
    { id: 3, label: 'Topping' },
    { id: 4, label: 'Gift Message' }
  ];

  return (
    <main className="flex-1 p-6 md:p-margin-page max-w-container-max mx-auto w-full">
      <div className="mb-stack-lg">
        <button 
          onClick={() => navigate('/options')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md mb-4"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Options
        </button>
        <h2 className="font-heading text-headline-lg text-on-surface mb-2">Create New Option</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Add a new customization choice for your customers. Assign it to the appropriate configuration step.
        </p>
      </div>

      <div ref={containerRef} className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Guidelines */}
        <div className="w-full lg:w-[320px] bg-surface-container-low rounded-2xl p-8 border border-surface-container self-start">
          <h2 className="text-[24px] font-heading font-bold text-primary mb-4">Option Details</h2>
          <p className="text-on-surface-variant leading-relaxed mb-8 font-body-md">
            Provide clear and concise details for each customization option.
          </p>

          <ul className="space-y-6">
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">check_circle</span>
              <span className="text-on-surface font-label-md leading-tight">Use 16:9 ratio images for best appearance on cards.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">check_circle</span>
              <span className="text-on-surface font-label-md leading-tight">Keep descriptions brief but descriptive.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">check_circle</span>
              <span className="text-on-surface font-label-md leading-tight">Price adjustments will be added to the base product price.</span>
            </li>
          </ul>
        </div>

        {/* Main Form Area */}
        <div className="flex-1 bg-surface-container-lowest rounded-2xl p-6 sm:p-10 border border-surface-container shadow-sm shadow-amber-900/5">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Image Upload */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                Option Image *
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full aspect-video sm:w-2/3 mx-auto rounded-xl border-2 border-dashed ${imagePreview ? 'border-primary' : 'border-outline-variant'} bg-surface-container-low flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container hover:border-primary transition-all group overflow-hidden`}
                style={{ backgroundImage: imagePreview ? `url(${imagePreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                {!imagePreview && (
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="w-14 h-14 bg-surface-container-lowest rounded-full flex items-center justify-center mb-4 text-primary shadow-sm">
                      <div className="relative">
                        <span className="material-symbols-outlined text-[24px]">image</span>
                        <div className="absolute -top-1 -right-1 bg-surface-container-lowest rounded-full p-0.5 border border-surface-container">
                          <span className="material-symbols-outlined text-[12px]">add</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-heading font-bold text-on-surface mb-1">Upload Image</h3>
                    <p className="text-on-surface-variant text-sm">Click to browse files</p>
                  </div>
                )}
                {imagePreview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-surface-container-lowest text-primary px-4 py-2 rounded-lg font-label-md shadow-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Change Image
                    </span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Configuration Step */}
              <div className="space-y-3 md:col-span-2">
                <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                  Configuration Step *
                </label>
                <div className="relative">
                  <select 
                    value={tabId}
                    onChange={(e) => setTabId(Number(e.target.value))}
                    className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all shadow-sm"
                  >
                    {steps.map(step => (
                      <option key={step.id} value={step.id}>{step.label}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-3 md:col-span-2">
                <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                  Option Name *
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. French Lavender"
                  className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50 transition-all shadow-sm"
                />
              </div>

              {/* Price Field */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                  Price Adjustment ($) *
                </label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 5.00"
                  className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50 transition-all shadow-sm"
                />
              </div>

              {/* Stock Field */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                  Stock Quantity *
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50 transition-all shadow-sm"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-3 md:col-span-2">
                <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                  Description
                </label>
                <textarea 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Provide a short, appealing description..."
                  rows="3"
                  className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50 transition-all shadow-sm resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 border-t border-surface-container border-dashed">
              <button 
                type="button"
                onClick={() => navigate('/options')}
                className="w-full sm:w-auto px-8 py-3.5 border border-surface-variant text-on-surface-variant font-label-md rounded-xl hover:bg-surface-container hover:text-on-surface transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!name || !imagePreview}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-on-primary font-label-md rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm shadow-amber-900/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add Option
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AddOption;
