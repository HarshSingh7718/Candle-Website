import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useCreateProduct } from '../hooks/useProducts';
import { useGetCategories } from '../hooks/useCategories';

const AddProduct = () => {
  const navigate = useNavigate();
    const { data: dbCategories = [], isLoading: isLoadingCategories } = useGetCategories();
    const [selectedCategories, setSelectedCategories] = useState([]);
  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  const mainRef = useRef(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scentProfile, setScentProfile] = useState('');
  const [vesselColor, setVesselColor] = useState('');
  const [weight, setWeight] = useState('');
  const [burnTime, setBurnTime] = useState('');
  const [material, setMaterial] = useState('');
  const [size, setSize] = useState('medium');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [type, setType] = useState('simpleCandle');

  // Toggles
  const [toggles, setToggles] = useState({
    isFeatured: false, isTrending: false, isBestSeller: false, isDiscounted: false, isLatest: true
  });

  // Images tracking
  const [imagePreviews, setImagePreviews] = useState([null, null, null, null]);
  const [imageFiles, setImageFiles] = useState([null, null, null, null]);
  const fileInputRefs = useRef([null, null, null, null]);

  useEffect(() => {
    gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
  }, []);

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews];
        newPreviews[index] = reader.result;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = (index) => fileInputRefs.current[index]?.click();

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !stock) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category', category);
    formData.append('type', type);
    formData.append('scent', scentProfile);
    formData.append('color', vesselColor);
    formData.append('weight', weight);
    formData.append('burnTime', burnTime);
    formData.append('material', material);
    formData.append('size', size);
    if (discountedPrice) formData.append('discountPrice', discountedPrice);

    // Append Toggles
    Object.keys(toggles).forEach(key => formData.append(key, toggles[key]));

    // Append Images (upload.array requires the same key name 'images')
    imageFiles.forEach(file => {
      if (file) formData.append('images', file);
    });

    try {
      await createProduct(formData);
      navigate('/inventory');
    } catch (error) { console.error(error); }
  };

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full opacity-0">
      <div className="mb-stack-lg">
        <button onClick={() => navigate('/inventory')} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md mb-4">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Inventory
        </button>
        <h2 className="font-heading text-headline-xl text-on-surface mb-2">Create New Product</h2>
        <p className="font-body-lg text-secondary">Craft a new artisanal entry for your collection</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-gutter">
        {/* LEFT COLUMN: Images & Descriptions */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">

          <section className="bg-surface-container-lowest p-stack-md rounded-xl border border-surface-container-highest shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-headline-md text-primary">Visual Presentation</h3>
              <span className="font-label-sm text-secondary">MAIN IMAGE REQUIRED</span>
            </div>
            <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[400px]">

              <div onClick={() => handleUploadClick(0)} className="col-span-2 row-span-2 relative group overflow-hidden rounded-lg bg-surface-container border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors" style={{ backgroundImage: imagePreviews[0] ? `url(${imagePreviews[0]})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {!imagePreviews[0] && (
                  <div className="relative z-10 flex flex-col items-center pointer-events-none">
                    <span className="material-symbols-outlined text-primary mb-2 text-[32px]">add_a_photo</span>
                    <p className="font-label-md text-primary">Main Cover</p>
                  </div>
                )}
                <input type="file" ref={el => fileInputRefs.current[0] = el} onChange={(e) => handleFileChange(0, e)} accept="image/*" className="hidden" disabled={isPending} />
              </div>

              {[1, 2, 3].map((index) => (
                <div key={index} onClick={() => handleUploadClick(index)} className={`${index === 1 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'} relative group overflow-hidden rounded-lg bg-surface-container border-2 border-dashed border-outline-variant flex items-center justify-center cursor-pointer hover:border-primary transition-colors`} style={{ backgroundImage: imagePreviews[index] ? `url(${imagePreviews[index]})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {!imagePreviews[index] && <span className="material-symbols-outlined text-primary text-[24px]">add_a_photo</span>}
                  <input type="file" ref={el => fileInputRefs.current[index] = el} onChange={(e) => handleFileChange(index, e)} accept="image/*" className="hidden" disabled={isPending} />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface-container-lowest p-stack-lg rounded-xl border border-surface-container-highest shadow-sm">
            <h3 className="font-heading text-headline-md text-primary mb-6">General Details</h3>
            <div className="space-y-6">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">PRODUCT NAME *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-4 font-body-md transition-colors outline-none" required disabled={isPending} />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">DESCRIPTION</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-4 font-body-md transition-colors outline-none resize-none" rows="6" disabled={isPending}></textarea>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-stack-lg rounded-xl border border-surface-container-highest shadow-sm">
            <h3 className="font-heading text-headline-md text-primary mb-6">Product Attributes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div><label className="block font-label-md text-on-surface-variant mb-2">SCENT PROFILE</label><input type="text" value={scentProfile} onChange={(e) => setScentProfile(e.target.value)} className="w-full bg-surface-container-low border-b border-outline-variant py-2 px-3 outline-none" /></div>
              <div><label className="block font-label-md text-on-surface-variant mb-2">VESSEL COLOR</label><input type="text" value={vesselColor} onChange={(e) => setVesselColor(e.target.value)} className="w-full bg-surface-container-low border-b border-outline-variant py-2 px-3 outline-none" /></div>
              <div><label className="block font-label-md text-on-surface-variant mb-2">WEIGHT (Gram)</label><input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-surface-container-low border-b border-outline-variant py-2 px-3 outline-none" /></div>
              <div><label className="block font-label-md text-on-surface-variant mb-2">BURN TIME (Hour)</label><input type="text" value={burnTime} onChange={(e) => setBurnTime(e.target.value)} className="w-full bg-surface-container-low border-b border-outline-variant py-2 px-3 outline-none" /></div>
              <div><label className="block font-label-md text-on-surface-variant mb-2">MATERIAL</label><input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full bg-surface-container-low border-b border-outline-variant py-2 px-3 outline-none" /></div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">SIZE</label>
                <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-surface-container-low border-b border-outline-variant py-2 px-3 outline-none">
                  <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <section className="bg-surface-container-lowest p-stack-md rounded-xl border border-surface-container-highest shadow-sm">
            <h3 className="font-heading text-headline-md text-primary mb-6">Pricing</h3>
            <div className="space-y-6">
              <div><label className="block font-label-md text-on-surface-variant mb-1">REGULAR PRICE (₹) *</label><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full bg-surface-container-low border-b border-outline-variant py-2 px-3 outline-none text-xl font-semibold" /></div>
              <div><label className="block font-label-md text-on-surface-variant mb-1">DISCOUNTED PRICE (₹)</label><input type="number" value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} className="w-full bg-surface-container-low border-b border-outline-variant py-2 px-3 outline-none text-xl font-semibold text-error" /></div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-stack-md rounded-xl border border-surface-container-highest shadow-sm">
            <h3 className="font-heading text-headline-md text-primary mb-6">Inventory</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block font-label-md text-on-surface-variant">
                    CATEGORY *
                  </label>
                </div>

                {isLoadingCategories ? (
                  <div className="w-full h-[120px] bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="w-full bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">

                    {/* Scrollable Container */}
                      <div className="max-h-[240px] overflow-y-auto hide-scrollbar p-3 space-y-2">

                      {dbCategories.map(cat => (
                        <label
                          key={cat._id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${category === cat._id
                              ? 'bg-primary/5 text-primary' // Selected state
                              : 'hover:bg-surface-container text-on-surface-variant' // Unselected hover state
                            }`}
                        >
                          {/* 👉 Changed to Radio Button */}
                          <input
                            type="radio"
                            name="productCategory" // Groups them together
                            checked={category === cat._id}
                            onChange={() => setCategory(cat._id)}
                            className="w-5 h-5 border-outline-variant text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                          />
                          <span className={`font-label-md select-none ${category === cat._id ? 'font-semibold' : ''}`}>
                            {cat.name}
                          </span>
                        </label>
                      ))}

                      {dbCategories.length === 0 && (
                        <div className="p-4 text-center text-sm text-error">
                          No categories found.
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
              <div><label className="block font-label-md text-on-surface-variant mb-1">STOCK LEVEL *</label><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className="w-full bg-surface-container-low border-b border-outline-variant py-2 px-3 outline-none" /></div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">PRODUCT TYPE</label>
                <div className="flex gap-2 mt-2">
                  <label className="flex-1 cursor-pointer"><input type="radio" name="type" value="simpleCandle" checked={type === 'simpleCandle'} onChange={() => setType('simpleCandle')} className="hidden peer" /><div className="text-center py-2 border border-outline-variant rounded peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary transition-all font-label-md">simpleCandle</div></label>
                  <label className="flex-1 cursor-pointer"><input type="radio" name="type" value="simpleRaw" checked={type === 'simpleRaw'} onChange={() => setType('simpleRaw')} className="hidden peer" /><div className="text-center py-2 border border-outline-variant rounded peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary transition-all font-label-md">simpleRaw</div></label>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-stack-md rounded-xl border border-surface-container-highest shadow-sm">
            <h3 className="font-heading text-headline-md text-primary mb-6">Visibility & Status</h3>
            <div className="space-y-4">
              {Object.keys(toggles).map(key => (
                <label key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <span className="font-label-md text-on-surface-variant capitalize">{key.replace('is', '')}</span>
                  <input type="checkbox" checked={toggles[key]} onChange={() => handleToggle(key)} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 accent-primary" />
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Action Button */}
        <div className="col-span-12 flex justify-end gap-4 pt-stack-lg border-t border-surface-container-highest">
          <button type="button" onClick={() => navigate('/inventory')} disabled={isPending} className="px-8 py-4 border border-outline-variant text-on-surface-variant font-heading text-headline-md rounded-lg hover:bg-surface-container transition-all cursor-pointer">Cancel</button>
          <button type="submit" disabled={isPending} className="px-12 py-4 bg-primary text-on-primary font-heading text-headline-md rounded-lg shadow-[0_2px_0_rgba(141,75,0,0.3)] hover:bg-primary-container active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-3 cursor-pointer">
            {isPending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-primary"></div> : <span className="material-symbols-outlined text-[24px]">add</span>}
            {isPending ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default AddProduct;