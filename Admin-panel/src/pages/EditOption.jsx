import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGetCustomization, useUpdateOption } from '../hooks/useOptions';

const EditOption = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: dbData, isLoading } = useGetCustomization();
  const { mutateAsync: updateOption, isPending } = useUpdateOption();
  const steps = dbData?.steps || [];

  const [stepNumber, setStepNumber] = useState('');
  const [stepTitle, setStepTitle] = useState(''); // 👉 Used for the read-only display
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (steps.length > 0) {
      // Find the specific option across all nested step arrays
      let foundOpt = null;
      let foundStep = null;

      steps.forEach(step => {
        const opt = step.options.find(o => o._id === id);
        if (opt) { foundOpt = opt; foundStep = step; }
      });

      if (foundOpt && foundStep) {
        setStepNumber(foundStep.stepNumber);
        setStepTitle(foundStep.title); // Store the step name
        setName(foundOpt.name || '');
        setDesc(foundOpt.desc || '');
        setPrice(foundOpt.price?.toString() || '0');
        setStock(foundOpt.stock?.toString() || '0');
        setImagePreview(foundOpt.image?.url || null);

        gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
      } else {
        navigate('/options'); // Redirect if ID is totally invalid
      }
    }
  }, [steps, id, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', Number(price));
    formData.append('stock', Number(stock));
    if (desc) formData.append('desc', desc);
    if (imageFile) formData.append('image', imageFile);

    try {
      await updateOption({ stepNumber, optionId: id, formData });
      navigate('/options');
    } catch (error) { console.error(error); }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <main className="flex-1 p-6 md:p-margin-page max-w-container-max mx-auto w-full opacity-0" ref={containerRef}>
      <div className="mb-stack-lg">
        <button onClick={() => navigate('/options')} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md mb-4 cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span> Back to Options
        </button>
        <h2 className="font-heading text-headline-lg text-on-surface mb-2">Edit Option</h2>
        <p className="font-body-md text-on-surface-variant max-w-2xl">Modify the details of this customization option.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[320px] bg-surface-container-low rounded-2xl p-8 border border-surface-container self-start">
          <h2 className="text-[24px] font-heading font-bold text-primary mb-4">Option Details</h2>
          <ul className="space-y-6">
            <li className="flex gap-3 items-start"><span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">check_circle</span><span className="text-on-surface font-label-md">Use 16:9 ratio images.</span></li>
            <li className="flex gap-3 items-start"><span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">check_circle</span><span className="text-on-surface font-label-md">Price adjustments will be added to the base.</span></li>
          </ul>
        </div>

        <div className="flex-1 bg-surface-container-lowest rounded-2xl p-6 sm:p-10 border border-surface-container shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">

            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">Option Image *</label>
              <div onClick={() => fileInputRef.current?.click()} className={`relative w-full aspect-video sm:w-2/3 mx-auto rounded-xl border-2 border-dashed ${imagePreview ? 'border-primary' : 'border-outline-variant'} bg-surface-container-low flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all group overflow-hidden ${isPending ? 'opacity-50 pointer-events-none' : ''}`} style={{ backgroundImage: imagePreview ? `url(${imagePreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {!imagePreview && (
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="w-14 h-14 bg-surface-container-lowest rounded-full flex items-center justify-center mb-4 text-primary shadow-sm"><span className="material-symbols-outlined text-[24px]">image</span></div>
                    <h3 className="text-lg font-heading font-bold text-on-surface mb-1">Upload Image</h3>
                  </div>
                )}
                {imagePreview && !isPending && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-surface-container-lowest text-primary px-4 py-2 rounded-lg font-label-md shadow-lg flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">edit</span>Change Image</span>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={isPending} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 👉 READ-ONLY CONFIGURATION STEP DISPLAY */}
              <div className="space-y-3 md:col-span-2">
                <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                  Configuration Step
                </label>
                <div className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-low text-on-surface font-body-md shadow-inner capitalize flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
                  <span className="text-on-surface-variant font-bold">Step {stepNumber}:</span> {stepTitle}
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">Option Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface focus:border-primary transition-all" required />
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">Price Adjustment (₹) *</label>
                <input type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} disabled={isPending} className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface focus:border-primary transition-all" required />
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">Stock Quantity *</label>
                <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} disabled={isPending} className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface focus:border-primary transition-all" required />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">Description</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows="3" disabled={isPending} className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface focus:border-primary transition-all resize-none" />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-surface-variant">
              <button type="button" onClick={() => navigate('/options')} disabled={isPending} className="px-8 py-3.5 border border-surface-variant text-on-surface-variant rounded-xl hover:bg-surface-container cursor-pointer disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={!name || isPending} className="px-8 py-3.5 bg-primary text-on-primary rounded-xl flex items-center gap-2 hover:bg-primary-container disabled:opacity-50 cursor-pointer">
                {isPending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-primary"></div> : <span className="material-symbols-outlined text-[20px]">save</span>}
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EditOption;