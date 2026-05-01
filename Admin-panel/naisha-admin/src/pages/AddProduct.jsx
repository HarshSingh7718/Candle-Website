import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useProducts } from '../context/ProductContext';

const AddProduct = () => {
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
  const [collection, setCollection] = useState('Signature Collection');
  const [stock, setStock] = useState('');
  const [type, setType] = useState('simpleCandle');
  const [imagePreviews, setImagePreviews] = useState([null, null, null, null]);

  const fileInputRefs = useRef([null, null, null, null]);
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const mainRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews];
        newPreviews[index] = reader.result;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = (index) => {
    fileInputRefs.current[index]?.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !stock) return; // Basic validation

    addProduct({
      name,
      collection,
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 0,
      image: imagePreviews[0] || ''
    });

    navigate('/inventory');
  };

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full">
      <div className="mb-stack-lg">
        <button 
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md mb-4"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Inventory
        </button>
        <h2 className="font-heading text-headline-xl text-on-surface mb-2">Create New Product</h2>
        <p className="font-body-lg text-secondary">Craft a new artisanal entry for your collection</p>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-gutter">
        {/* LEFT COLUMN: Images & Descriptions */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          
          {/* 1. Product Images Bento Grid */}
          <section className="bg-surface-container-lowest p-stack-md rounded-xl border border-surface-container-highest shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-headline-md text-primary">Visual Presentation</h3>
              <span className="font-label-sm text-secondary">MAIN IMAGE REQUIRED</span>
            </div>
            <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[400px]">
              
              {/* Main Cover (Index 0) */}
              <div 
                onClick={() => handleUploadClick(0)}
                className="col-span-2 row-span-2 relative group overflow-hidden rounded-lg bg-surface-container border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                style={{ backgroundImage: imagePreviews[0] ? `url(${imagePreviews[0]})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                {!imagePreviews[0] && (
                  <div className="relative z-10 flex flex-col items-center pointer-events-none">
                    <span className="material-symbols-outlined text-primary mb-2 text-[32px]">add_a_photo</span>
                    <p className="font-label-md text-primary">Main Cover</p>
                  </div>
                )}
                {imagePreviews[0] && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-surface-container-lowest text-primary px-4 py-2 rounded-lg font-label-md shadow-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Change Image
                    </span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={el => fileInputRefs.current[0] = el} 
                  onChange={(e) => handleFileChange(0, e)} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Other Placeholders */}
              {[1, 2, 3].map((index) => (
                <div 
                  key={index}
                  onClick={() => handleUploadClick(index)}
                  className={`${index === 1 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'} relative group overflow-hidden rounded-lg bg-surface-container border-2 border-dashed border-outline-variant flex items-center justify-center cursor-pointer hover:border-primary transition-colors`}
                  style={{ backgroundImage: imagePreviews[index] ? `url(${imagePreviews[index]})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  {!imagePreviews[index] && (
                    <span className="material-symbols-outlined text-primary text-[24px]">add_a_photo</span>
                  )}
                  {imagePreviews[index] && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-surface-container-lowest text-primary p-2 rounded-full shadow-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={el => fileInputRefs.current[index] = el} 
                    onChange={(e) => handleFileChange(index, e)} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              ))}
            </div>
          </section>

          {/* 2. Basic Information Card */}
          <section className="bg-surface-container-lowest p-stack-lg rounded-xl border border-surface-container-highest shadow-sm">
            <h3 className="font-heading text-headline-md text-primary mb-6">General Details</h3>
            <div className="space-y-6">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">PRODUCT NAME *</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-4 font-body-md transition-colors placeholder:text-secondary/50 outline-none" 
                  placeholder="e.g., Midnight Jasmine & Sandalwood" 
                  required
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">DESCRIPTION</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-3 px-4 font-body-md transition-colors placeholder:text-secondary/50 outline-none resize-none" 
                  placeholder="Describe the scent journey, the mood, and the artisanal process..." 
                  rows="6"
                ></textarea>
              </div>
            </div>
          </section>

          {/* 5. Attributes Grid */}
          <section className="bg-surface-container-lowest p-stack-lg rounded-xl border border-surface-container-highest shadow-sm">
            <h3 className="font-heading text-headline-md text-primary mb-6">Product Attributes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">SCENT PROFILE</label>
                <input 
                  type="text"
                  value={scentProfile}
                  onChange={(e) => setScentProfile(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-2 px-3 outline-none transition-colors" 
                  placeholder="Floral, Woody" 
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">VESSEL COLOR</label>
                <input 
                  type="text"
                  value={vesselColor}
                  onChange={(e) => setVesselColor(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-2 px-3 outline-none transition-colors" 
                  placeholder="Matte Charcoal" 
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">WEIGHT</label>
                <input 
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-2 px-3 outline-none transition-colors" 
                  placeholder="250g" 
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">BURN TIME</label>
                <input 
                  type="text"
                  value={burnTime}
                  onChange={(e) => setBurnTime(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-2 px-3 outline-none transition-colors" 
                  placeholder="45-50 Hours" 
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">MATERIAL</label>
                <input 
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-2 px-3 outline-none transition-colors" 
                  placeholder="Organic Soy Wax" 
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">SIZE</label>
                <select 
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-2 px-3 outline-none transition-colors"
                >
                  <option value="small">small</option>
                  <option value="medium">medium</option>
                  <option value="big">big</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Pricing, Inventory & Status */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          
          {/* 3. Pricing Card */}
          <section className="bg-surface-container-lowest p-stack-md rounded-xl border border-surface-container-highest shadow-sm">
            <h3 className="font-heading text-headline-md text-primary mb-6">Pricing</h3>
            <div className="space-y-6">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">REGULAR PRICE ($) *</label>
                <input 
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-2 px-3 outline-none text-xl font-semibold" 
                  placeholder="45.00" 
                  required
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">DISCOUNTED PRICE ($)</label>
                <input 
                  type="number"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-2 px-3 outline-none text-xl font-semibold text-error" 
                  placeholder="38.00" 
                />
              </div>
            </div>
          </section>

          {/* 4. Inventory & Classification */}
          <section className="bg-surface-container-lowest p-stack-md rounded-xl border border-surface-container-highest shadow-sm">
            <h3 className="font-heading text-headline-md text-primary mb-6">Inventory</h3>
            <div className="space-y-6">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">CATEGORY</label>
                <select 
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-2 px-3 outline-none"
                >
                  <option value="Signature Collection">Signature Collection</option>
                  <option value="Botanical Series">Botanical Series</option>
                  <option value="Limited Edition">Limited Edition</option>
                  <option value="Seasonal Collection">Seasonal Collection</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">STOCK LEVEL *</label>
                <input 
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:ring-0 py-2 px-3 outline-none" 
                  placeholder="120" 
                  required
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">PRODUCT TYPE</label>
                <div className="flex gap-2 mt-2">
                  <label className="flex-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="simpleCandle" 
                      checked={type === 'simpleCandle'}
                      onChange={() => setType('simpleCandle')}
                      className="hidden peer" 
                    />
                    <div className="text-center py-2 border border-outline-variant rounded peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary transition-all font-label-md">
                        simpleCandle
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="simpleRaw"
                      checked={type === 'simpleRaw'}
                      onChange={() => setType('simpleRaw')} 
                      className="hidden peer" 
                    />
                    <div className="text-center py-2 border border-outline-variant rounded peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary transition-all font-label-md">
                        simpleRaw
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Status Toggles */}
          <section className="bg-surface-container-lowest p-stack-md rounded-xl border border-surface-container-highest shadow-sm">
            <h3 className="font-heading text-headline-md text-primary mb-6">Visibility & Status</h3>
            <div className="space-y-4">
              {['featured', 'trending', 'bestseller', 'discounted', 'latest'].map(statusItem => (
                <label key={statusItem} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <span className="font-label-md text-on-surface-variant capitalize">{statusItem}</span>
                  <input type="checkbox" defaultChecked={statusItem === 'latest'} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 accent-primary" />
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* 7. Action Button */}
        <div className="col-span-12 flex justify-end gap-4 pt-stack-lg border-t border-surface-container-highest">
          <button 
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-8 py-4 border border-outline-variant text-on-surface-variant font-heading text-headline-md rounded-lg hover:bg-surface-container transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-12 py-4 bg-primary text-on-primary font-heading text-headline-md rounded-lg shadow-[0_2px_0_rgba(141,75,0,0.3)] hover:bg-primary-container active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-3 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">add</span>
            Add Product
          </button>
        </div>
      </form>
    </main>
  );
};

export default AddProduct;
