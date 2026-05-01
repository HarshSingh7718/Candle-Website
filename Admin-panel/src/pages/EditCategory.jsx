import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useCategories } from '../context/CategoryContext';

const EditCategory = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { categories, updateCategory } = useCategories();

  useEffect(() => {
    const category = categories.find(c => c.id.toString() === id);
    if (category) {
      setTitle(category.title);
      setDescription(category.description || '');
      setImagePreview(category.image);
    } else {
      navigate('/categories');
    }

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, [id, categories, navigate]);

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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    
    updateCategory(Number(id), { title, description, image: imagePreview });
    navigate('/categories');
  };

  return (
    <main className="flex-1 p-6 md:p-margin-page max-w-container-max mx-auto w-full">
      <div className="mb-stack-lg">
        <button 
          onClick={() => navigate('/categories')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md mb-4"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Categories
        </button>
        <h2 className="font-heading text-headline-lg text-on-surface mb-2">Edit Category</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Update the details for this product collection.
        </p>
      </div>

      <div ref={containerRef} className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Artisanal Visuals */}
        <div className="w-full lg:w-[320px] bg-surface-container-low rounded-2xl p-8 border border-surface-container self-start">
          <h2 className="text-[24px] font-heading font-bold text-primary mb-4">Artisanal Visuals</h2>
          <p className="text-on-surface-variant leading-relaxed mb-8 font-body-md">
            Categories define the structure of Lumière. Use clear imagery and descriptive titles to guide your customers.
          </p>

          <ul className="space-y-6">
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">check_circle</span>
              <span className="text-on-surface font-label-md leading-tight">Use high-resolution photography with natural lighting.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">check_circle</span>
              <span className="text-on-surface font-label-md leading-tight">Keep category names concise and descriptive.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">check_circle</span>
              <span className="text-on-surface font-label-md leading-tight">Descriptions should highlight the collection's unique essence.</span>
            </li>
          </ul>
        </div>

        {/* Main Form Area */}
        <div className="flex-1 bg-surface-container-lowest rounded-2xl p-6 sm:p-10 border border-surface-container shadow-sm shadow-amber-900/5">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Category Image Upload */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                Category Image
              </label>
              <div 
                onClick={handleUploadClick}
                className={`relative w-full aspect-[1.8/1] rounded-xl border-2 border-dashed ${imagePreview ? 'border-primary' : 'border-outline-variant'} bg-surface-container-low flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container hover:border-primary transition-all group overflow-hidden`}
                style={{ backgroundImage: imagePreview ? `url(${imagePreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                {!imagePreview && (
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center mb-5 text-primary shadow-sm">
                      <div className="relative">
                        <span className="material-symbols-outlined text-[28px]">image</span>
                        <div className="absolute -top-1 -right-1 bg-surface-container-lowest rounded-full p-0.5 border border-surface-container">
                          <span className="material-symbols-outlined text-[14px]">add</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-on-surface mb-1">Click to Upload</h3>
                    <p className="text-on-surface-variant mb-6 text-sm">The category image will appear here</p>
                    <span className="px-4 py-1.5 bg-surface-variant rounded-full text-[11px] font-bold text-on-surface-variant">
                      800 x 800px (Recommended)
                    </span>
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

            {/* Name Field */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                Name *
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scented Candles"
                className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50 transition-all shadow-sm"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                Description
              </label>
              <textarea 
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Hand-poured soy wax candles with premium essential oils"
                className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50 transition-all shadow-sm resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex items-center justify-end gap-4 border-t border-surface-container border-dashed">
              <button 
                type="button"
                onClick={() => navigate('/categories')}
                className="w-full sm:w-auto px-8 py-3.5 border border-surface-variant text-on-surface-variant font-label-md rounded-xl hover:bg-surface-container hover:text-on-surface transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!title}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-on-primary font-label-md rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm shadow-amber-900/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EditCategory;
